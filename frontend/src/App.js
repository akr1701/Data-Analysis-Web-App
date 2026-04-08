import { useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("");

  const uploadFile = async (regionValue = selectedRegion) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("region", regionValue);

    const res = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setData(result);
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>📊 Superstore Dashboard</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setData(null);
          }}
        />
        <button
          onClick={() => uploadFile()}
          style={{
            marginLeft: "10px",
            padding: "8px 15px",
            background: "#38bdf8",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Upload CSV
        </button>
      </div>

      {data && (
        <>
          <h3 style={{ textAlign: "center" }}>Total Rows: {data.rows}</h3>

          {/* Dropdown */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <select
              value={selectedRegion}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedRegion(value);
                if (file) uploadFile(value);
              }}
              style={{ padding: "8px" }}
            >
              <option value="">All Regions</option>
              {data?.regions?.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Charts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            
            {/* Sales */}
            {data?.sales_by_category && (
              <div style={{ background: "#1e293b", padding: "15px", borderRadius: "10px" }}>
                <h3>Sales by Category</h3>
                <Bar
                  data={{
                    labels: Object.keys(data.sales_by_category),
                    datasets: [
                      {
                        label: "Sales",
                        data: Object.values(data.sales_by_category),
                      },
                    ],
                  }}
                />
              </div>
            )}

            {/* Profit */}
            {data?.profit_by_region && (
              <div style={{ background: "#1e293b", padding: "15px", borderRadius: "10px" }}>
                <h3>Profit by Region</h3>
                <Bar
                  data={{
                    labels: Object.keys(data.profit_by_region),
                    datasets: [
                      {
                        label: "Profit",
                        data: Object.values(data.profit_by_region),
                      },
                    ],
                  }}
                />
              </div>
            )}

            {/* Top Products */}
            {data?.top_products && (
              <div style={{ background: "#1e293b", padding: "15px", borderRadius: "10px", gridColumn: "span 2" }}>
                <h3>Top 5 Products</h3>
                <Bar
                  data={{
                    labels: Object.keys(data.top_products),
                    datasets: [
                      {
                        label: "Sales",
                        data: Object.values(data.top_products),
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