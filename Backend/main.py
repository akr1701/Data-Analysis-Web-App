from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API running"}

@app.post("/analyze")
async def analyze(file: UploadFile, region: str = Form(None)):
    df = pd.read_csv(file.file, encoding='latin1')

    # 🔥 Filter
    if region:
        df = df[df["Region"] == region]

    # 📊 Insights
    sales_by_category = df.groupby("Category")["Sales"].sum().to_dict()
    profit_by_region = df.groupby("Region")["Profit"].sum().to_dict()

    # 🌍 Regions
    all_regions = df["Region"].unique().tolist()

    # 🏆 Top 5 Products
    top_products = (
        df.groupby("Product Name")["Sales"]
        .sum()
        .sort_values(ascending=False)
        .head(5)
        .to_dict()
    )

    # 🧠 NEW (Assignment Requirements)

    # Column names
    columns = df.columns.tolist()

    # Data types
    dtypes = df.dtypes.astype(str).to_dict()

    # Missing values
    missing_values = df.isnull().sum().to_dict()

    # Summary statistics
    summary = df.describe().to_dict()

    return {
        "rows": len(df),
        "columns": columns,
        "dtypes": dtypes,
        "missing_values": missing_values,
        "summary": summary,
        "sales_by_category": sales_by_category,
        "profit_by_region": profit_by_region,
        "regions": all_regions,
        "top_products": top_products
    }