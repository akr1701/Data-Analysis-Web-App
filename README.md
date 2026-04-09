# 📊 Data Analysis Web App (FastAPI + React)

A professional full-stack data analysis platform that allows users to upload any CSV file and generate real-time insights, detailed statistical summaries, and dynamic visualizations.

---

## 🌐 Live Demo

🚀 **Application URL:** [https://prismatic-tiramisu-964888.netlify.app](https://prismatic-tiramisu-964888.netlify.app)  
📘 **API Documentation (Swagger):** [https://data-analysis-backend-hz2b.onrender.com/docs](https://data-analysis-backend-hz2b.onrender.com/docs)  
🔧 **Backend API Base:** [https://data-analysis-backend-hz2b.onrender.com](https://data-analysis-backend-hz2b.onrender.com)

---

## 🚀 Key Features

### 🔹 Advanced Data Analysis (Pandas Engine)
- **Automatic Metadata Detection:** Identifies column names and data types (dtypes) instantly.
- **Missing Value Analysis:** Detects and counts null values across the entire dataset.
- **Summary Statistics:** Provides deep insights using Mean, Min, and Max for all numeric columns.

### 🔹 Interactive Visualization & Dashboard
- **Dynamic Charts:** Users can select specific columns from a dropdown to generate interactive Bar charts.
- **Automated Insights:** Highlighted cards showing "Highest Performing Column" and "Total Missing Values" for quick decision making.
- **Responsive UI:** Dark-themed, modern dashboard built with React and Chart.js.

### 🔹 Professional API Structure
- **ID-Based Session Management:** Implemented an ID-based system to store and retrieve dataset analysis without re-uploading files.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Hooks, Fetch API)
- **Backend:** FastAPI (Python)
- **Data Processing:** Pandas
- **Visualization:** Chart.js / react-chartjs-2
- **Deployment:** Netlify (Frontend) & Render (Backend)

---

## 📖 API Endpoints (Restful Design)

As per the assignment requirements, the following structured endpoints are implemented:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/upload` | `POST` | Uploads CSV and returns a unique `dataset_id`. |
| `/summary/{id}` | `GET` | Fetches Data Types, Missing Values, and Stats (Mean, Min, Max). |
| `/plot-data/{id}` | `GET` | Returns dynamic chart-ready data based on selected column. |

---

## 📂 Project Structure

```text
DataAnalysisapp/
│
├── Backend/
│   ├── main.py           # FastAPI logic with Pandas processing
│   └── requirements.txt  # Python dependencies (FastAPI, Pandas, etc.)
│
└── frontend/
    ├── src/
    │   ├── App.js        # Main Dashboard logic and API integration
    │   └── ...           # React components and styling
    └── package.json      # Frontend dependencies

---

## ⚙️ Installation & Setup

Follow these steps to set up and run the project locally on your machine:

### 🔹 1. Backend Setup (FastAPI)
Initialize the Python environment and install the necessary dependencies:

```powershell
# Navigate to the Backend folder
cd Backend

# Create a Virtual Environment
python -m venv venv

# Activate the Virtual Environment
# For Windows:
.\venv\Scripts\activate

# Install required Python packages
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn main:app --reload

---

### 🔹 2. Frontend Setup (React)

Open a new terminal and follow these steps to set up the React dashboard:

```powershell
# Navigate to the frontend folder
cd frontend

# Install necessary Node.js dependencies
npm install

# Start the development server
npm start
 ---

## 👨‍💻 Developer & Project Information

| Detail | Information |
| :--- | :--- |
| **Developer Name** | **Ankit Kumar** |
| **Role** | Software Developer |
| **Project Name** |  Data Analysis  Web App|
| **Main Tools** | FastAPI, React, Pandas, Chart.js |
| 
---