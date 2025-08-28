using System.Collections.Generic;

namespace BulkUploaderApp.Models
{
    public class ActualCostCategory
    {
        public string Name { get; set; }
        public double? Amount { get; set; }
    }

    public class Actual
    {
        public string PhaseCode { get; set; }
        public string CBSPositionCode { get; set; }
        public string PostingDate { get; set; }
        public string Notes { get; set; }
        public double? Quantity { get; set; }
        public double? ManHours { get; set; }
        public string ActualsUserDefined3 { get; set; }
        public string ActualsUserDefined4 { get; set; }
        public string ActualsUserDefined5 { get; set; }
        public string ActualsUserDefined6 { get; set; }
        public Cost Cost { get; set; }
    }

    public class Cost
    {
        public List<ActualCostCategory> CostCategories { get; set; }
    }

    public class ProjectData
    {
        public string ProjectDisplay { get; set; }
        public List<Actual> Actuals { get; set; } = new List<Actual>();
        public string SourceSystemId { get; set; }
        public string SourceSystemName { get; set; }
    }
}