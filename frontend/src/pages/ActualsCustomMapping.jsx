// src/pages/ActualsCustomMapping.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import axios from "axios";
import { Save, SaveAll, Zap, CircleX } from "lucide-react"; // lucide-react icons

const ActualsCustomMapping = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // Get uploaded file data from previous page
  const preview = location.state?.preview || [];
  const fileColumns = location.state?.columns || [];

  // Track which mappedColumns are already used
  const [usedMappings, setUsedMappings] = useState([]);

  // Define standard InEight fields to map
  const ineightFields = [
    { id: 0, name: "* Project ID", mapped: "", mappedColumn: "" },
    { id: 1, name: "* CBS position", mapped: "", mappedColumn: "" },
    { id: 2, name: "WBS phase code", mapped: "", mappedColumn: "" },
    { id: 3, name: "* Posting date", mapped: "", mappedColumn: "" },
    { id: 4, name: "Cost categories", mapped: "", mappedColumn: "" },
    { id: 5, name: "Notes", mapped: "", mappedColumn: "" },
    { id: 6, name: "Cost", mapped: "", mappedColumn: "" },
    { id: 7, name: "Claimed quantities", mapped: "", mappedColumn: "" },
    { id: 8, name: "Number of man hours", mapped: "", mappedColumn: "" },
    { id: 9, name: "Number of equipment hours", mapped: "", mappedColumn: "" },
    { id: 10, name: "Actuals user defined 1", mapped: "", mappedColumn: "" },
    { id: 11, name: "Actuals user defined 2", mapped: "", mappedColumn: "" },
    { id: 12, name: "Actuals user defined 3", mapped: "", mappedColumn: "" },
    { id: 13, name: "Actuals user defined 4", mapped: "", mappedColumn: "" },
    { id: 14, name: "Actuals user defined 5", mapped: "", mappedColumn: "" },
    { id: 15, name: "Actuals user defined 6", mapped: "", mappedColumn: "" },
  ];

  const [mapping, setMapping] = useState({});
  const [templateName, setTemplateName] = useState("");
  const [templatesList, setTemplatesList] = useState([]);

  // --- state additions ---
  const [showTextbox, setShowTextbox] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // initialise rows from ineightFields
  const [rows, setRows] = useState(
    ineightFields.map((field) => ({
      ...field, // keep the same structure
    }))
  );

  // Load all templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = Object.keys(localStorage)
      .filter((key) => key.startsWith("template_"))
      .map((key) => key.replace("template_", ""));
    setTemplatesList(savedTemplates);
  }, []);

  //handleChange for Mapped Columns field drop-down
  const handleChange = (id, column) => {
    setRows((prev) =>
      prev.map((field) => {
        if (field.id === id) {
          // If user selects "Select Column", clear mapped and mappedColumn
          if (!column) {
            setUsedMappings((prevUsed) =>
              prevUsed.filter((used) => used !== field.mappedColumn)
            );
            return {
              ...field,
              mappedColumn: "",
              mapped: false,
            };
          }

          // Otherwise, update normally
          // Determine mapped value: key symbol for primary key, true for others
          const mappedValue = field.id == 1 ? "🔑" : true;

          // Add column to usedMappings
          setUsedMappings((prevUsed) => [...prevUsed, column]);

          return {
            ...field,
            mappedColumn: column,
            mapped: mappedValue,
          };
        }
        return field;
      })
    );

    // Update global mapping state
    setMapping((prev) => ({
      ...prev,
      [id]: column,
    }));
  };

  // Whenever mapping changes AND a template is selected → mark as modified
  useEffect(() => {
    if (templateName) {
      setIsModified(true);
    }
  }, [mapping]);

  // --- update save handlers ---
  const handleSave = () => {
    if (!templateName) return;
    localStorage.setItem(`template_${templateName}`, JSON.stringify(mapping));
    showSuccess(`Template "${templateName}" saved!`);
    setIsModified(false);
  };

  //Saving a template
  const handleSaveAs = () => {
    if (!templateName) {
      showError("Enter a template name");
      return;
    }
    localStorage.setItem(`template_${templateName}`, JSON.stringify(mapping));
    showSuccess(`Template "${templateName}" saved!`);

    // Refresh templates list
    const savedTemplates = Object.keys(localStorage)
      .filter((key) => key.startsWith("template_"))
      .map((key) => key.replace("template_", ""));
    setTemplatesList(savedTemplates);

    setShowTextbox(false);
    setIsModified(false);
  };

  // Load a template from localStorage
  const handleSelectTemplate = (name) => {
    if (!name) return;
    const savedMapping = JSON.parse(localStorage.getItem(`template_${name}`));
    if (!savedMapping) return;

    // Update rows and mapping
    setRows((prevRows) =>
      prevRows.map((field) => {
        const col = savedMapping[field.id];
        if (!col) return { ...field, mappedColumn: "", mapped: false };

        const mappedValue = field.id == 1 ? "🔑" : true;
        return { ...field, mappedColumn: col, mapped: mappedValue };
      })
    );

    setMapping(savedMapping);
    setUsedMappings(Object.values(savedMapping));
    setTemplateName(name);
  };

  const handleReset = () => {
    setMapping({});
    setUsedMappings([]);
    setRows(ineightFields.map((field) => ({ ...field })));
    setTemplateName("");
  };

  const handleAutoMap = () => {
    const normalize = (text) =>
      text
        .replace(/[^a-zA-Z0-9]/g, "") // remove non-alphanumeric chars
        .toLowerCase()
        .trim(); // lowercase and trim spaces

    const newRows = rows.map((field) => {
      // Look for a matching column
      const match = fileColumns.find(
        (col) => normalize(col) === normalize(field.name)
      );

      if (match) {
        // If match found, update mapped and mappedColumn
        return {
          ...field,
          mappedColumn: match,
          mapped: field.id === 1 ? "🔑" : true, // primary key symbol for CBS position
        };
      }

      // No match
      return { ...field, mappedColumn: "", mapped: false };
    });

    setRows(newRows);

    // Update global mapping object
    const newMapping = {};
    newRows.forEach((field) => {
      if (field.mappedColumn) newMapping[field.id] = field.mappedColumn;
    });
    setMapping(newMapping);

    // Update usedMappings
    setUsedMappings(Object.values(newMapping));

    // Mark as modified if template is selected
    if (templateName) setIsModified(true);
  };

  const handleDeleteTemplate = () => {
    if (!templateName) return;

    localStorage.removeItem(`template_${templateName}`);
    showSuccess(`Template "${templateName}" deleted!`);

    // Refresh templates list
    const savedTemplates = Object.keys(localStorage)
      .filter((key) => key.startsWith("template_"))
      .map((key) => key.replace("template_", ""));
    setTemplatesList(savedTemplates);

    // Reset selection if deleted
    setTemplateName("");
    setMapping({});
    setUsedMappings([]);
    setRows(ineightFields.map((field) => ({ ...field })));
  };

  const handleNext = async () => {
    try {
      // Kick off validation (returns a validationId to track progress)
      const res = await axios.post("/api/validate", { fileId: "xyz123" });

      const validationId = res.data.validationId;

      // Navigate immediately to next page with validationId
      navigate("/actualscustommapping", { state: { validationId } });
    } catch (err) {
      console.error("Validation request failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-5xl w-full bg-white px-4 shadow-lg rounded-md flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold mb-4">
            Map columns – Custom Mapping
          </h2>

          {/* Save template section */}
          <div className="flex justify-between mb-2 items-center">
            {/* Auto-map button on the left */}
            <button
              onClick={handleAutoMap}
              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-yellow-600"
              title="Map automatically"
            >
              <Zap size={20} className="mr-1" />
              Auto-map
            </button>

            {/* Save template controls on the right */}
            <div className="flex items-center space-x-2">
              {templateName && showTextbox == false && (
                <button onClick={handleDeleteTemplate} title="Delete Template">
                  <CircleX size={25} color="red" />
                </button>
              )}

              <select
                value={templateName}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">-- Select Template --</option>
                {templatesList.map((temp) => (
                  <option key={temp} value={temp}>
                    {temp}
                  </option>
                ))}
              </select>

              {showTextbox && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter template name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <button
                    onClick={handleSaveAs}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={!isModified}
                className={`p-2 rounded ${
                  isModified
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
                title="Save"
              >
                <Save size={20} />
              </button>

              <button
                onClick={() => setShowTextbox((prev) => !prev)}
                className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                title="Save As"
              >
                <SaveAll size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable table section */}
        <div className="flex-1 overflow-y-auto mb-4 border rounded">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="p-2 border">Control Field</th>
                <th className="p-2 border">Mapped</th>
                <th className="p-2 border">File Column</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((field) => (
                <tr key={field.id}>
                  <td className="p-2 border">{field.name}</td>
                  <td className="p-2 border text-center">
                    {field.mapped === "🔑" ? "🔑" : field.mapped ? "✅" : ""}
                  </td>
                  <td className="p-2 border">
                    <select
                      value={field.mappedColumn || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="border p-1 rounded w-full"
                    >
                      <option value="">-- Select Column --</option>
                      {fileColumns.map((col) => (
                        <option
                          key={col}
                          value={col}
                          disabled={
                            usedMappings.includes(col) &&
                            field.mappedColumn !== col
                          }
                        >
                          {col}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fixed footer buttons */}
        <div className="flex justify-end space-x-4 border-t pt-4 pb-4 px-4 sticky bottom-0 bg-white">
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-gray-400 rounded hover:bg-gray-100"
          >
            Reset
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-400 rounded hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActualsCustomMapping;
