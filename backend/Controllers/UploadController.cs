using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using OfficeOpenXml;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using BulkUploaderApp.Models; // Import ProjectModels.cs
using ClosedXML.Excel;

namespace BulkUploaderApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly IHttpClientFactory _httpClientFactory;


        public UploadController(IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _config = config;
            _httpClientFactory = httpClientFactory; // DI handled correctly
        }

        // ------------------------------
        // Upload Excel
        // ------------------------------
        [HttpPost("upload")]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File missing");

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);

            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheets.First();

            var data = new List<List<object>>();

            foreach (var row in worksheet.RowsUsed()) // Efficient for large files
            {
                var rowData = row.CellsUsed()
                     .Select(c => (object)c.Value.ToString()) // convert to plain string
                     .ToList();
                data.Add(rowData);
            }

            var columns = data.FirstOrDefault() ?? new List<object>();
            return Ok(new { columns, data });
        }

        // ------------------------------
        // Post to InEight
        // ------------------------------
        [HttpPost("post-to-ineight")]
        public async Task<IActionResult> PostToInEight([FromBody] List<ProjectData> sheetData)
        {
            try
            {
                var token = await GetAccessToken();

                var cfg = _config.GetSection("InEight");
                var request = new HttpRequestMessage(HttpMethod.Post, cfg["ApiUrl"])
                {
                    Content = new StringContent(JsonConvert.SerializeObject(sheetData), Encoding.UTF8, "application/json")
                };

                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                request.Headers.Add("X-IN8-TENANT-PREFIX", cfg["TenantPrefix"]);
                request.Headers.Add("Ocp-Apim-Subscription-Key", cfg["SubscriptionKey"]);

                var response = await _httpClient.SendAsync(request);
                var respContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, respContent);

                return Ok(respContent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // ------------------------------
        // Get OAuth2 Token
        // ------------------------------
        private async Task<string> GetAccessToken()
        {
            var cfg = _config.GetSection("InEight");
            var parameters = new List<KeyValuePair<string, string>>
        {
            new("grant_type", "client_credentials"),
            new("client_id", cfg["ClientId"]),
            new("client_secret", cfg["ClientSecret"]),
            new("resource", cfg["SsoClientId"])
        };

            var content = new FormUrlEncodedContent(parameters);
            var response = await _httpClient.PostAsync(cfg["TokenUrl"], content);
            response.EnsureSuccessStatusCode(); // throws if 4xx/5xx
            var responseContent = await response.Content.ReadAsStringAsync();

            // Strongly-typed token deserialization
            var tokenResult = JsonConvert.DeserializeObject<TokenResponse>(responseContent);
            return tokenResult?.access_token ?? throw new Exception("Failed to get access token");
        }

        // ------------------------------
        // Token response model
        // ------------------------------
        private class TokenResponse
        {
            public string access_token { get; set; }
        }
    }
}
