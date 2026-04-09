# 📊 Data Analysis Web App

A high-performance **full-stack data analysis platform** that transforms raw CSV data into meaningful business insights through real-time visualizations and dynamic filtering.

---

## 🌐 Live Demo

🚀 **Application URL:**  
https://prismatic-tiramisu-964888.netlify.app  

This is a fully deployed full-stack web application where the frontend and backend are seamlessly integrated. Users can upload datasets, apply filters, and view real-time data visualizations.

---

### 🔧 Backend API (Optional)
https://data-analysis-backend-hz2b.onrender.com  

### 📘 API Documentation
https://data-analysis-backend-hz2b.onrender.com/docs  

---

## 🚀 Features

### 📊 Data Insights
- **Sales Analysis:** Revenue aggregation by product category  
- **Profit Analysis:** Region-wise profit breakdown  
- **Top Products:** Top 5 products based on total sales  

### ⚡ Interactivity
- **Dynamic Region Filter:** Update dashboard in real-time (East, West, Central, South)  
- **Live Data Processing:** Upload CSV and instantly visualize results  
- **Interactive Charts:** Built using Chart.js  

---

## 🛠️ Tech Stack

- **Frontend:** React.js  
- **Backend:** FastAPI (REST API)  
- **Data Processing:** Pandas  
- **Visualization:** Chart.js  
- **Deployment:** Netlify (Frontend), Render (Backend)  

---

## 📂 Project Structure

DataAnalysisapp/
│
├── Backend/
│ ├── main.py
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ ├── public/
│ └── package.json


---

## ⚙️ Installation & Setup

### 🔹 Backend Setup

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload

🔹 Frontend Setup

cd frontend
npm install
npm start

How It Works
Upload a CSV dataset
Backend processes data using Pandas
API returns structured insights
Frontend renders interactive charts

👨‍💻 Developer

Ankit Kumar
💻 Full Stack Developer
