from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import uuid
import numpy as np
import io
import logging
import os
from dotenv import load_dotenv
from upstash_redis import Redis

app = FastAPI()

logging.basicConfig(level=logging.INFO)

# Load env variables
load_dotenv()

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://data-analysis-web-app-delta.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis (Upstash)
redis_client = Redis(
    url=os.getenv("UPSTASH_REDIS_REST_URL"),
    token=os.getenv("UPSTASH_REDIS_REST_TOKEN")
)

EXPIRY_TIME = 300  # 5 minutes


@app.get("/")
def home():
    return {"message": "Data Analysis API is running"}


# --- Clean NaN for JSON ---
def clean_nan(data):
    if isinstance(data, dict):
        return {k: clean_nan(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_nan(v) for v in data]
    elif isinstance(data, float) and np.isnan(data):
        return None
    return data


# --- Background processing ---
def process_file(file_id: str, contents: bytes):
    try:
        try:
            df = pd.read_csv(io.BytesIO(contents), encoding="utf-8")
        except:
            df = pd.read_csv(io.BytesIO(contents), encoding="latin1")

        #  proper format
        redis_client.set(file_id, df.to_json(orient="records"))
        redis_client.expire(file_id, EXPIRY_TIME)

        logging.info(f"File processed: {file_id}")

    except Exception as e:
        logging.error(f"Processing error: {str(e)}")


# --- Upload CSV ---
@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    contents = await file.read()

    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    file_id = str(uuid.uuid4())[:8]

    #  old task 
    # background_tasks.add_task(process_file, file_id, contents)

    #  update upload error
    process_file(file_id, contents)

    return {
        "id": file_id,
        "message": "File uploaded & processed"
    }


# --- Summary ---
@app.get("/summary/{id}")
def get_summary(id: str):

    data = redis_client.get(id)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Data not ready or expired"
        )

    # ✅ FIX
    if isinstance(data, bytes):
        data = data.decode("utf-8")

    df = pd.read_json(data, orient="records")

    numeric_df = df.select_dtypes(include=['number'])

    summary = {
        "columns": df.columns.tolist(),
        "data_types": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "stats": numeric_df.describe().to_dict() if not numeric_df.empty else {}
    }

    insights = {
        "highest_avg_column": numeric_df.mean().idxmax() if not numeric_df.empty else None,
        "total_missing": int(df.isnull().sum().sum())
    }

    return clean_nan({
        "summary": summary,
        "insights": insights
    })


# --- Plot Data ---
@app.get("/plot-data/{id}")
def get_plot_data(id: str, column: str = None):

    data = redis_client.get(id)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Data not ready or expired"
        )

    if isinstance(data, bytes):
        data = data.decode("utf-8")

    df = pd.read_json(data, orient="records")

    if column and column in df.columns:
        selected = df[column]
    else:
        selected = df.iloc[:, 0]

    chart_data = selected.value_counts().head(10).to_dict()

    return {"chart_data": clean_nan(chart_data)}

