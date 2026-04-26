import { useState, useEffect, useCallback, useRef } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import "chart.js/auto";

const API_BASE = "https://data-analysis-backend-hz2b.onrender.com";

const styles = {
  app: {
    background: "#0a0f1e",
    minHeight: "100vh",
    color: "#e2e8f0",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "0",
  },
  header: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    borderBottom: "1px solid #1e3a5f",
    padding: "24px 40px",
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#38bdf8",
    margin: 0,
  },
  headerSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  uploadBox: {
    border: "2px dashed #1e3a5f",
    borderRadius: "16px",
    padding: "48px 24px",
    textAlign: "center",
    background: "#0f172a",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "24px",
  },
  uploadBoxActive: {
    border: "2px dashed #38bdf8",
    background: "#0f2040",
  },
  uploadIcon: { fontSize: "48px", marginBottom: "16px" },
  uploadText: { fontSize: "18px", fontWeight: "600", color: "#cbd5e1", marginBottom: "8px" },
  uploadSubtext: { fontSize: "13px", color: "#475569", marginBottom: "20px" },
  fileSelected: {
    fontSize: "13px",
    color: "#38bdf8",
    background: "#0f2a3d",
    padding: "8px 16px",
    borderRadius: "8px",
    display: "inline-block",
    marginBottom: "20px",
  },
  btn: {
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  statusBar: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "14px 20px",
    marginBottom: "24px",
    fontSize: "14px",
    color: "#94a3b8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "24px",
  },
  cardTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
  },
  cardValue: { fontSize: "26px", fontWeight: "700", color: "#38bdf8" },
  cardSub: { fontSize: "12px", color: "#475569", marginTop: "4px" },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: "16px",
    paddingBottom: "10px",
    borderBottom: "1px solid #1e293b",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    color: "#64748b",
    fontWeight: "600",
    borderBottom: "1px solid #1e293b",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  td: { padding: "10px 14px", borderBottom: "1px solid #0f172a", color: "#cbd5e1" },
  chartControls: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  select: {
    background: "#1e293b",
    color: "#e2e8f0",
    border: "1px solid #334155",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    flex: 1,
    minWidth: "180px",
  },
  chartTypeBtn: {
    background: "#1e293b",
    color: "#94a3b8",
    border: "1px solid #334155",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  chartTypeBtnActive: {
    background: "#0ea5e9",
    color: "white",
    border: "1px solid #0ea5e9",
  },
};

function App() {
  const [file, setFile] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [backendReady, setBackendReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // wake up the backend as soon as page loads
  useEffect(() => {
    setMessage("⏳ Connecting to server...");
    fetch(`${API_BASE}/`)
      .then(() => {
        setBackendReady(true);
        setMessage("✅ Server ready! Upload a CSV file to begin.");
      })
      .catch(() => {
        setMessage("⚠️ Server warming up, please wait...");
        setTimeout(() => {
          fetch(`${API_BASE}/`)
            .then(() => {
              setBackendReady(true);
              setMessage("✅ Server ready! Upload a CSV file to begin.");
            })
            .catch(() => setMessage("❌ Server unreachable. Try refreshing."));
        }, 5000);
      });
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith(".csv")) {
      setFile(dropped);
    } else {
      setMessage("⚠️ Only CSV files are supported.");
    }
  };

  const fetchSummary = useCallback(async (id, retry = 0) => {
    try {
      const res = await fetch(`${API_BASE}/summary/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Summary not ready");
      }
      const result = await res.json();
      setSummaryData(result);
      setMessage("✅ Analysis complete!");
      setLoading(false);
    } catch (err) {
      if (retry < 5) {
        setMessage(`⏳ Processing... (${retry + 1}/5)`);
        setTimeout(() => fetchSummary(id, retry + 1), 2000);
      } else {
        setMessage(`❌ ${err.message}. Please try again.`);
        setLoading(false);
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first");

    setLoading(true);
    setSummaryData(null);
    setChartData(null);
    setSelectedColumn("");
    setMessage("📤 Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      const result = await res.json();
      setDatasetId(result.id);
      setMessage("⏳ Analyzing data...");
      setTimeout(() => fetchSummary(result.id), 1500);
    } catch (err) {
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

  const chartColors = ["#38bdf8","#818cf8","#34d399","#f472b6","#fb923c","#a78bfa","#2dd4bf","#fbbf24"];

  const renderChart = () => {
    if (!chartData) return null;
    const labels = Object.keys(chartData);
    const values = Object.values(chartData);
    const dataset = {
      label: selectedColumn,
      data: values,
      backgroundColor: chartColors.slice(0, labels.length),
      borderColor: "#38bdf8",
      borderWidth: chartType === "line" ? 2 : 0,
      tension: 0.4,
      fill: false,
    };
    const data = { labels, datasets: [dataset] };
    const options = {
      responsive: true,
      plugins: { legend: { labels: { color: "#94a3b8" } } },
      scales: chartType !== "pie" ? {
        x: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
        y: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
      } : {},
    };
    if (chartType === "bar") return <Bar data={data} options={options} />;
    if (chartType === "line") return <Line data={data} options={options} />;
    if (chartType === "pie") return <Pie data={data} options={options} />;
  };

  const stats = summaryData?.summary?.stats || {};
  const columns = summaryData?.summary?.columns || [];
  const missingValues = summaryData?.summary?.missing_values || {};
  const dataTypes = summaryData?.summary?.data_types || {};

  return (
    <div style={styles.app}>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📊 Data Analysis</h1>
        <p style={styles.headerSubtitle}>Upload a CSV and explore your data instantly</p>
      </div>

      <div style={styles.main}>

        {/* Upload area — supports drag & drop and click */}
        <div
          style={{ ...styles.uploadBox, ...(isDragging ? styles.uploadBoxActive : {}) }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <div style={styles.uploadIcon}>📁</div>
          <p style={styles.uploadText}>
            {isDragging ? "Drop it here!" : "Drag & drop your CSV file here"}
          </p>
          <p style={styles.uploadSubtext}>or click to browse — max 5MB</p>

          {file && <div style={styles.fileSelected}>📄 {file.name}</div>}

          <br />
          <button
            style={{ ...styles.btn, ...(!backendReady || loading ? styles.btnDisabled : {}) }}
            disabled={!backendReady || loading}
            onClick={(e) => { e.stopPropagation(); handleUpload(); }}
          >
            {loading ? "⏳ Analyzing..." : "Upload & Analyze"}
          </button>
        </div>

        {message && <div style={styles.statusBar}>{message}</div>}

        {summaryData && (
          <>
            {/* Quick insight cards */}
            <div style={styles.grid}>
              <div style={styles.card}>
                <p style={styles.cardTitle}>Top Column</p>
                <p style={styles.cardValue}>{summaryData?.insights?.highest_avg_column || "N/A"}</p>
                <p style={styles.cardSub}>Highest average value</p>
              </div>
              <div style={styles.card}>
                <p style={styles.cardTitle}>Missing Values</p>
                <p style={styles.cardValue}>{summaryData?.insights?.total_missing ?? 0}</p>
                <p style={styles.cardSub}>Across all columns</p>
              </div>
              <div style={styles.card}>
                <p style={styles.cardTitle}>Total Columns</p>
                <p style={styles.cardValue}>{columns.length}</p>
                <p style={styles.cardSub}>Fields in dataset</p>
              </div>
              <div style={styles.card}>
                <p style={styles.cardTitle}>Numeric Columns</p>
                <p style={styles.cardValue}>
                  {Object.values(dataTypes).filter(t => t.includes("int") || t.includes("float")).length}
                </p>
                <p style={styles.cardSub}>Analyzable columns</p>
              </div>
            </div>

            {/* Column details table */}
            <div style={{ ...styles.card, marginBottom: "24px" }}>
              <p style={styles.sectionTitle}>Column Overview</p>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Column</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Missing</th>
                      <th style={styles.th}>Mean</th>
                      <th style={styles.th}>Min</th>
                      <th style={styles.th}>Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((col, i) => (
                      <tr key={col} style={i % 2 !== 0 ? { background: "#0a1628" } : {}}>
                        <td style={styles.td}>{col}</td>
                        <td style={{ ...styles.td, color: "#64748b" }}>{dataTypes[col] || "—"}</td>
                        <td style={{ ...styles.td, color: missingValues[col] > 0 ? "#f87171" : "#34d399" }}>
                          {missingValues[col] ?? 0}
                        </td>
                        <td style={styles.td}>{stats[col]?.mean != null ? stats[col].mean.toFixed(2) : "—"}</td>
                        <td style={styles.td}>{stats[col]?.min != null ? stats[col].min.toFixed(2) : "—"}</td>
                        <td style={styles.td}>{stats[col]?.max != null ? stats[col].max.toFixed(2) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart section */}
            <div style={styles.card}>
              <p style={styles.sectionTitle}>📈 Visualization</p>
              <div style={styles.chartControls}>
                <select
                  style={styles.select}
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  <option value="">-- Select a column --</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>

                {["bar", "line", "pie"].map((type) => (
                  <button
                    key={type}
                    style={{ ...styles.chartTypeBtn, ...(chartType === type ? styles.chartTypeBtnActive : {}) }}
                    onClick={() => setChartType(type)}
                  >
                    {type === "bar" ? "📊 Bar" : type === "line" ? "📈 Line" : "🥧 Pie"}
                  </button>
                ))}
              </div>

              {chartData ? (
                <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                  {renderChart()}
                </div>
              ) : (
                <p style={{ color: "#475569", textAlign: "center", padding: "40px 0" }}>
                  Select a column above to generate a chart
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;