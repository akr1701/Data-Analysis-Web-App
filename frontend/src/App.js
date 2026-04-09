import { useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("");

  const uploadFile = async (regionValue = selectedRegion) => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("region", regionValue);

    try {
      const res = await fetch("https://data-analysis-backend-hz2b.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      console.log(result); // DEBUG
      setData(result);
    } catch (err) {
      console.error("Error:", err);
      alert("Backend not reachable");
    }
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>📊 Data Analysis Web App</h1>

      {/* Upload */}
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

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            
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

          {/* Columns */}
          {data?.columns && (
            <div style={{ marginTop: "30px" }}>
              <h3>Columns</h3>
              <ul>
                {data.columns.map((col, i) => (
                  <li key={i}>{col}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Types */}
          {data?.dtypes && (
            <div style={{ marginTop: "20px" }}>
              <h3>Data Types</h3>
              <ul>
                {Object.entries(data.dtypes).map(([col, type], i) => (
                  <li key={i}>
                    {col}: {type}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Values */}
          {data?.missing_values && (
            <div style={{ marginTop: "20px" }}>
              <h3>Missing Values</h3>
              <ul>
                {Object.entries(data.missing_values).map(([col, val], i) => (
                  <li key={i}>
                    {col}: {val}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {data?.summary && Object.keys(data.summary).length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Summary Statistics</h3>

              <table border="1" style={{ width: "100%", marginTop: "10px", color: "white" }}>
                <thead>
                  <tr>
                    <th>Column</th>
                    {Object.keys(data.summary[Object.keys(data.summary)[0]]).map((stat, i) => (
                      <th key={i}>{stat}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(data.summary).map(([col, stats], i) => (
                    <tr key={i}>
                      <td>{col}</td>
                      {Object.values(stats).map((val, j) => (
                        <td key={j}>
                          {typeof val === "number" ? val.toFixed(2) : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;