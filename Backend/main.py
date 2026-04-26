from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import uuid
import numpy as np
import io
import gc
import logging
import os
from dotenv import load_dotenv
from upstash_redis import Redis

load_dotenv()

app = FastAPI()

logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_client = Redis(
    url=os.getenv("UPSTASH_REDIS_REST_URL"),
    token=os.getenv("UPSTASH_REDIS_REST_TOKEN")
)

# 30 minute expiry — enough for any session
EXPIRY_TIME = 1800
MAX_ROWS = 500
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB


@app.get("/")
def home():
    return {"message": "Data Analysis API is running"}


def clean_nan(data):
    if isinstance(data, dict):
        return {k: clean_nan(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_nan(v) for v in data]
    elif isinstance(data, float) and np.isnan(data):
        return None
    return data


def process_file(file_id: str, contents: bytes):
    # try utf-8 first, fall back to latin1 for older files
    try:
        df = pd.read_csv(io.BytesIO(contents), encoding="utf-8")
    except Exception:
        df = pd.read_csv(io.BytesIO(contents), encoding="latin1")

    # free tier has 512MB limit so cap rows to avoid OOM crash
    if len(df) > MAX_ROWS:
        logging.info(f"Large file — trimming to {MAX_ROWS} rows")
        df = df.head(MAX_ROWS)

    # convert string columns to category dtype — saves a lot of memory
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype("category")

    redis_client.set(file_id, df.to_json(orient="records"))
    redis_client.expire(file_id, EXPIRY_TIME)

    # explicitly free memory after saving
    del df
    gc.collect()

    logging.info(f"Stored file_id: {file_id}")


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large — max 2MB allowed")

    file_id = str(uuid.uuid4())[:8]

    try:
        process_file(file_id, contents)
    except Exception as e:
        logging.error(f"Upload processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Could not process file: {str(e)}")

    return {"id": file_id, "message": "File uploaded and processed successfully"}


@app.get("/summary/{id}")
def get_summary(id: str):
    try:
        data = redis_client.get(id)

        if not data:
            raise HTTPException(
                status_code=404,
                detail="Data not found — it may have expired. Please re-upload the file."
            )

        if isinstance(data, bytes):
            data = data.decode("utf-8")

        df = pd.read_json(io.StringIO(data), orient="records")
        numeric_df = df.select_dtypes(include=["number"])

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

        del df, numeric_df
        gc.collect()

        return clean_nan({"summary": summary, "insights": insights})

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Summary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong while fetching summary")


@app.get("/plot-data/{id}")
def get_plot_data(id: str, column: str = None):
    try:
        data = redis_client.get(id)

        if not data:
            raise HTTPException(
                status_code=404,
                detail="Data not found — it may have expired. Please re-upload the file."
            )

        if isinstance(data, bytes):
            data = data.decode("utf-8")

        df = pd.read_json(io.StringIO(data), orient="records")
        if column and column in df.columns:
            selected = df[column]
        else:
            selected = df.iloc[:, 0]

        chart_data = selected.value_counts().head(10).to_dict()

        del df
        gc.collect()

        return {"chart_data": clean_nan(chart_data)}

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Plot error: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong while fetching chart data")