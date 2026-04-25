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
  const [message, setMessage] = useState("");

  const API_BASE = "https://data-analysis-backend-hz2b.onrender.com";

  // 🔥 Wake backend (Render sleep fix)
  useEffect(() => {
    fetch(`${API_BASE}/`)
      .then(() => console.log("Backend ready"))
      .catch(() => console.log("Backend sleeping"));
  }, []);

  // 📤 Upload CSV
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setLoading(true);
    setMessage("Uploading file...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const result = await res.json();
      setDatasetId(result.id);

      setMessage("Processing file... please wait ⏳");

      // ⏳ wait for backend processing
      setTimeout(() => {
        fetchSummary(result.id);
      }, 2000);

    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed! Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 📊 Fetch Summary (with retry)
  const fetchSummary = async (id, retry = 0) => {
    try {
      const res = await fetch(`${API_BASE}/summary/${id}`);

      if (!res.ok) {
        throw new Error("Summary not ready");
      }

      const result = await res.json();
      setSummaryData(result);
      setMessage("✅ Data loaded successfully!");

    } catch (err) {
      if (retry < 5) {
        console.log("Retrying summary...", retry);
        setMessage("⏳ Preparing data... retrying");
        setTimeout(() => fetchSummary(id, retry + 1), 2000);
      } else {
        setMessage("❌ Failed to load data");
      }
    }
  };

  // 📈 Fetch Chart Data
  const fetchChartData = useCallback(async (col) => {
    if (!datasetId || !col) return;

    try {
      const res = await fetch(
        `${API_BASE}/plot-data/${datasetId}?column=${col}`
      );

      if (!res.ok) return;

      const result = await res.json();
      setChartData(result.chart_data);

    } catch (err) {
      console.log("Chart error", err);
    }
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

      {/* Upload */}
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <br /><br />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Upload File"}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <p style={{ textAlign: "center", color: "#facc15" }}>
          {message}
        </p>
      )}

      {/* Summary */}
      {summaryData && (
        <>
          <div style={{ marginTop: "30px" }}>
            <h3>Insights</h3>
            <p>
              Top Column:{" "}
              {summaryData?.insights?.highest_avg_column || "N/A"}
            </p>
            <p>
              Missing Values:{" "}
              {summaryData?.insights?.total_missing || 0}
            </p>
          </div>

          {/* Chart */}
          <div style={{ marginTop: "30px" }}>
            <h3>Visualization</h3>

            <select
              onChange={(e) => setSelectedColumn(e.target.value)}
              value={selectedColumn}
            >
              <option value="">Choose Column</option>
              {summaryData?.summary?.columns?.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>

            {chartData && (
              <div style={{ marginTop: "20px" }}>
                <Bar
                  data={{
                    labels: Object.keys(chartData),
                    datasets: [
                      {
                        label: "Distribution",
                        data: Object.values(chartData),
                      },
                    ],
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