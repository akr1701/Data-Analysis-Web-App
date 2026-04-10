import { useState, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function App() {
  const [file, setFile] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://data-analysis-backend-hz2b.onrender.com";

  // 1. Upload CSV
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      setDatasetId(result.id);
      fetchSummary(result.id);
    } catch (err) {
      alert("Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  // 2. Summary
  const fetchSummary = async (id) => {
    const res = await fetch(`${API_BASE}/summary/${id}`);
    const result = await res.json();
    setSummaryData(result);
  };

  // 3. Chart Data (FIXED with useCallback)
  const fetchChartData = useCallback(async (col) => {
    if (!datasetId || !col) return;

    const res = await fetch(
      `${API_BASE}/plot-data/${datasetId}?column=${col}`
    );

    const result = await res.json();
    setChartData(result.chart_data);
  }, [datasetId]);

  useEffect(() => {
    if (selectedColumn) {
      fetchChartData(selectedColumn);
    }
  }, [selectedColumn, fetchChartData]);

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#38bdf8" }}>
        📊 Data Analysis Web App
      </h1>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleUpload}>
          {loading ? "Processing..." : "Upload File"}
        </button>
      </div>

      {summaryData && (
        <>
          <div>
            <h3>Insights</h3>
            <p>
              Top Column: {summaryData.insights.highest_avg_column}
            </p>
            <p>
              Missing Values: {summaryData.insights.total_missing}
            </p>
          </div>

          <div>
            <h3>Visualization</h3>

            <select
              onChange={(e) => setSelectedColumn(e.target.value)}
            >
              <option value="">Choose Column</option>
              {summaryData.summary.columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>

            {chartData && (
              <Bar
                data={{
                  labels: Object.keys(chartData),
                  datasets: [
                    {
                      label: `Distribution`,
                      data: Object.values(chartData),
                    },
                  ],
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;