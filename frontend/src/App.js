import { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";

function App() {
  const [file, setFile] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://data-analysis-backend-hz2b.onrender.com"; // Apne backend URL se check karein

  // 1. Upload CSV and get ID
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      const result = await res.json();
      setDatasetId(result.id);
      fetchSummary(result.id);
    } catch (err) {
      alert("Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Summary Statistics & Insights
  const fetchSummary = async (id) => {
    const res = await fetch(`${API_BASE}/summary/${id}`);
    const result = await res.json();
    setSummaryData(result);
  };

  // 3. Fetch Chart Data based on selected column
  const fetchChartData = async (col) => {
    if (!datasetId || !col) return;
    const res = await fetch(`${API_BASE}/plot-data/${datasetId}?column=${col}`);
    const result = await res.json();
    setChartData(result.chart_data);
  };

  useEffect(() => {
    if (selectedColumn) fetchChartData(selectedColumn);
  }, [selectedColumn]);

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "40px" }}>
      <h1 style={{ textAlign: "center", color: "#38bdf8" }}>📊 Data Analysis Dashboard</h1>

      {/* --- Upload Section --- */}
      <div style={{ textAlign: "center", margin: "30px 0", padding: "20px", background: "#1e293b", borderRadius: "10px" }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button 
          onClick={handleUpload} 
          style={{ padding: "10px 20px", background: "#38bdf8", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          {loading ? "Processing..." : "Analyze Dataset"}
        </button>
      </div>

      {summaryData && (
        <>
          {/* --- Insights Section (Assignment Requirement) --- */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
            <div style={{ flex: 1, background: "#0369a1", padding: "20px", borderRadius: "10px" }}>
              <h4>Top Performing Column (Avg)</h4>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>{summaryData.insights.highest_avg_column}</p>
            </div>
            <div style={{ flex: 1, background: "#9f1239", padding: "20px", borderRadius: "10px" }}>
              <h4>Total Missing Values</h4>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>{summaryData.insights.total_missing}</p>
            </div>
          </div>

          {/* --- Visualization Section --- */}
          <div style={{ background: "#1e293b", padding: "20px", borderRadius: "10px", marginBottom: "30px" }}>
            <h3>📈 Dynamic Visualizations</h3>
            <label>Select Column to Visualize: </label>
            <select 
              onChange={(e) => setSelectedColumn(e.target.value)} 
              style={{ padding: "8px", marginLeft: "10px", borderRadius: "5px" }}
            >
              <option value="">-- Choose Column --</option>
              {summaryData.summary.columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>

            {chartData && (
              <div style={{ marginTop: "20px", height: "400px" }}>
                <Bar 
                  data={{
                    labels: Object.keys(chartData),
                    datasets: [{ label: `Distribution of ${selectedColumn}`, data: Object.values(chartData), backgroundColor: "#38bdf8" }]
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            )}
          </div>

          {/* --- Data Summary Table (Assignment Requirement) --- */}
          <div style={{ background: "#1e293b", padding: "20px", borderRadius: "10px" }}>
            <h3>📋 Dataset Metadata & Statistics</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
              <thead>
                <tr style={{ background: "#334155" }}>
                  <th style={{ padding: "12px" }}>Column</th>
                  <th>Type</th>
                  <th>Missing</th>
                  <th>Mean</th>
                  <th>Min</th>
                  <th>Max</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.summary.columns.map((col) => (
                  <tr key={col} style={{ borderBottom: "1px solid #334155", textAlign: "center" }}>
                    <td style={{ padding: "12px" }}>{col}</td>
                    <td>{summaryData.summary.data_types[col]}</td>
                    <td>{summaryData.summary.missing_values[col]}</td>
                    <td>{summaryData.summary.stats[col]?.mean?.toFixed(2) || "N/A"}</td>
                    <td>{summaryData.summary.stats[col]?.min?.toFixed(2) || "N/A"}</td>
                    <td>{summaryData.summary.stats[col]?.max?.toFixed(2) || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;