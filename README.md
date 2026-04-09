# 📊 Data Analysis Web App

A full-stack data analysis platform that allows users to upload any CSV file and generate real-time insights, visualizations, and statistical summaries.


---

## 🌐 Live Demo

🚀 **Application URL:**  
https://prismatic-tiramisu-964888.netlify.app  

This is a fully deployed full-stack web application where the frontend and backend are seamlessly integrated. Users can upload datasets, apply fil##ters, and view real-time data visualizations.

---

### 🔧 Backend API (Optional)
https://data-analysis-backend-hz2b.onrender.com  

### 📘 API Documentation
https://data-analysis-backend-hz2b.onrender.com/docs  

---

 ## 🚀 Features

### 🔹 CSV Upload & Processing
- Upload any CSV dataset  
- Automatic parsing and analysis using backend engine  

### 🔹 Data Insights
- Sales aggregation by category  
- Profit distribution by region  
- Top-performing products (Top 5)  
- Total row count  

### 🔹 Advanced Analysis
- Column listing  
- Data types detection  
- Missing values detection  
- Summary statistics (mean, min, max, etc.)  

### 🔹 Interactive Dashboard
- Dynamic region filter  
- Real-time chart updates  
- Responsive UI with dark theme  

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

cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload

### 🔹 Frontend Setup

cd frontend
npm install
npm start

 ### How It Works
1. User uploads a CSV file  
2. Frontend sends file to FastAPI backend  
3. Backend processes data  
4. API returns structured insights  
5. Frontend renders charts and tables  

👨‍💻 Developer

   Ankit Kumar
💻 Full Stack Developer
