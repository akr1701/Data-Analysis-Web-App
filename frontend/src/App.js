import { useState, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const API_BASE = "https://data-analysis-backend-hz2b.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [backendReady, setBackendReady] = useState(false);

  // ping the backend on load so Render wakes up before user tries to upload
  useEffect(() => {
    setMessage("⏳ Connecting to server...");
    fetch(`${API_BASE}/`)
      .then(() => {
        setBackendReady(true);
        setMessage("✅ Server ready! You can upload now.");
      })
      .catch(() => {
        setMessage("⚠️ Server is warming up, please wait a moment...");
        setTimeout(() => {
          fetch(`${API_BASE}/`)
            .then(() => {
              setBackendReady(true);
              setMessage("✅ Server ready! You can upload now.");
            })
            .catch(() => setMessage("❌ Server not reachable. Try refreshing the page."));
        }, 5000);
      });
  }, []);

  const fetchSummary = useCallback(async (id, retry = 0) => {
    try {
      const res = await fetch(`${API_BASE}/summary/${id}`);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Summary not ready");
      }

      const result = await res.json();
      setSummaryData(result);
      setMessage("✅ Data loaded successfully!");
      setLoading(false);
    } catch (err) {
      if (retry < 5) {
        setMessage(`⏳ Processing data... (attempt ${retry + 1}/5)`);
        setTimeout(() => fetchSummary(id, retry + 1), 2000);
      } else {
        setMessage(`❌ ${err.message}. Please try uploading again.`);
        setLoading(false);
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first");

    // reset everything before new upload
    setLoading(true);
    setSummaryData(null);
    setChartData(null);
    setSelectedColumn("");
    setMessage("📤 Uploading file...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      const result = await res.json();
      setDatasetId(result.id);
      setMessage("⏳ Processing data, please wait...");

      // small delay before hitting summary — gives backend time to finish writing to Redis
      setTimeout(() => fetchSummary(result.id), 1500);
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
      setLoading(false);
    }
  };

  const fetchChartData = useCallback(async (col) => {
    if (!datasetId || !col) return;
    try {
      const res = await fetch(`${API_BASE}/plot-data/${datasetId}?column=${col}`);
      if (!res.ok) return;
      const result = await res.json();
      setChartData(result.chart_data);
    } catch (err) {
      console.error("Chart fetch error:", err);
    }
  }, [datasetId]);

  useEffect(() => {
    if (selectedColumn) fetchChartData(selectedColumn);
  }, [selectedColumn, fetchChartData]);

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "40px" }}>
      <h1 style={{ textAlign: "center", color: "#38bdf8" }}>📊 Data Analysis Web App</h1>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br /><br />
        {/* button stays disabled until backend is confirmed awake */}
        <button onClick={handleUpload} disabled={loading || !backendReady}>
          {loading ? "Processing... please wait ⏳" : "Upload & Analyze"}
        </button>
      </div>

      {message && (
        <p style={{ textAlign: "center", color: "#facc15", fontSize: "16px" }}>
          {message}
        </p>
      )}

      {summaryData && (
        <>
          <div style={{ marginTop: "30px" }}>
            <h3>📌 Insights</h3>
            <p>Top Column: <strong>{summaryData?.insights?.highest_avg_column || "N/A"}</strong></p>
            <p>Total Missing Values: <strong>{summaryData?.insights?.total_missing ?? 0}</strong></p>
          </div>

          <div style={{ marginTop: "30px" }}>
            <h3>📈 Visualization</h3>
            <select onChange={(e) => setSelectedColumn(e.target.value)} value={selectedColumn}>
              <option value="">-- Choose a Column --</option>
              {summaryData?.summary?.columns?.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            {chartData && (
              <div style={{ marginTop: "20px", maxWidth: "700px", margin: "20px auto" }}>
                <Bar
                  data={{
                    labels: Object.keys(chartData),
                    datasets: [{
                      label: selectedColumn || "Distribution",
                      data: Object.values(chartData),
                      backgroundColor: "#38bdf8",
                    }],
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;