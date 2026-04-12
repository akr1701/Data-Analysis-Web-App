from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import uuid

app = FastAPI()

# ✅ CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage to keep track of uploaded datasets
# Real project mein database ya Redis use hota hai, par assignment ke liye ye sahi hai.
data_store = {}

@app.get("/")
def home():
    return {"message": "Data Analysis API is running"}

# 1. Upload CSV 
@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        df = pd.read_csv(file.file, encoding='latin1')
        file_id = str(uuid.uuid4())[:8] # Generate a short unique ID
        data_store[file_id] = df
        
        return {
            "id": file_id,
            "message": "File uploaded successfully",
            "columns": df.columns.tolist(),
            "total_rows": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Return dataset summary 
@app.get("/summary/{id}")
async def get_summary(id: str):
    if id not in data_store:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = data_store[id]
    
    # Core Analysis 
    summary = {
        "columns": df.columns.tolist(),
        "data_types": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "stats": df.describe().to_dict(), # Mean, Min, Max 
    }
    
    # Extra Insights 
    numeric_df = df.select_dtypes(include=['number'])
    highest_avg_col = numeric_df.mean().idxmax() if not numeric_df.empty else "N/A"
    
    return {
        "summary": summary,
        "insights": {
            "highest_avg_column": highest_avg_col,
            "total_missing": int(df.isnull().sum().sum())
        }
    }

# 3.  Return chart data 
@app.get("/plot-data/{id}")
async def get_plot_data(id: str, column: str = None):
    if id not in data_store:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = data_store[id]
    
    if column and column in df.columns:
        # User selection ke basis par data (Top 10 values for clean charts)
        chart_data = df[column].value_counts().head(10).to_dict()
    else:
        # Default chart data (e.g., first available numeric column)
        chart_data = df.iloc[:, 0].value_counts().head(10).to_dict()

    return {"chart_data": chart_data}