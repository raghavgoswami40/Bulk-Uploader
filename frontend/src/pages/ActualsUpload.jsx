// ActualsUpload.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const ActualsUpload = () => {
  const [file, setFileData] = useState(null);
  const [sourceSystem, setSourceSystem] = useState("");
  const [preview, setPreview] = useState([]);
  const [fileName, setFileName] = useState("");
  const [columns, setColumns] = useState(null);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // Change this to match your ASP.NET Core backend
  const API_BASE = "http://localhost:5236/api";  

  // Upload file to ASP.NET Core backend
  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API_BASE}/Upload/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("Columns:", res.data.columns);
      console.log("Data:", res.data.data);

      setPreview(res.data.data); 
      setColumns(res.data.columns); 
      setFileName(file.name);
      
    } catch (error) {
      console.error("Upload error:", error);
      showError("Failed to upload file. Check console for details.");
    }
  };

  // // POST preview data to backend / InEight API
  // const handlePost = async () => {
  //   try {
  //     const res = await axios.post(`${API_BASE}/Upload/post-to-ineight`, preview, {
  //       headers: { "Content-Type": "application/json" }
  //     });
  //     alert(`Status: ${res.data.status}`);
  //   } catch (error) {
  //     console.error("POST error:", error);
  //     alert("Failed to post data to InEight. Check console for details.");
  //   }
  // };

  // Cancel button: reset everything
  const handleCancel = () => {
    setFileData(null);
    setFileName("");
    setSourceSystem("");
    setPreview([]);

    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Handle the Next button
  const handleNext = () => {
    if (sourceSystem === "custom") {
      navigate("/ActualsCustomMapping", { state: { columns, preview } }); 
    } else {
      showSuccess("Proceeding with standard mapping...");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Multi Project Bulk Upload</h2>

        {/* Upload Section */}
        <div
          className={`border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center ${
            fileName ? "bg-green-100 border-green-400" : "border-gray-300"
          }`}
        >
          <p className="text-gray-600 mb-2">
            Import from Excel (.xlsx, .xls) or Comma separated value (.csv)
          </p>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="fileInput"
          />

          <span>{fileName ? fileName : "No file selected yet"}</span>

          <button
            type="button"
            onClick={() => document.getElementById("fileInput").click()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          >
            Browse
          </button>
        </div>

        {/* Options Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Options</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              * Source System
            </label>
            <select
              value={sourceSystem}
              onChange={(e) => setSourceSystem(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Source System</option>
              <option value="custom">Custom Mapping</option>
              <option value="mwz">SAP MyWorkZone (MWZ)</option>
              <option value="jde">JD Edwards (JDE)</option>
            </select>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-md p-4 mt-4 text-sm text-gray-700">
            <p>
              <strong>ℹ️</strong> If the Source system is known, select from the available list of configured mappings. If your system is not available, select Custom mapping to map the fields in the next page.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            className="px-6 py-2 border border-gray-400 text-gray-600 rounded-md hover:bg-gray-100"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActualsUpload;
