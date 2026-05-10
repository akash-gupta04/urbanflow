# 🌆 UrbanFlow

**AI-Powered Smart City Intelligence Platform**

UrbanFlow is a smart city intelligence platform designed to improve **urban mobility, emergency response, and sustainable transportation** using **AI-powered recommendations, real-time routing, predictive analytics, and live city monitoring**.

Built for the **IBM Z x UNSA Hackathon 2026**, UrbanFlow combines **live city data**, **Google Maps intelligence**, and **IBM Granite Time Series forecasting** to help cities make smarter transportation and emergency decisions.

---

## 🚀 Features

### 📊 Live City Dashboard

* Real-time city metrics
* Traffic reduction insights
* Transit efficiency monitoring
* Emergency accessibility indicators
* Sustainability metrics

### 🗺️ Smart Routing & Navigation

* Google Maps powered directions
* Transit, walking, and driving routes
* Live ETA and route optimization
* Turn-by-turn directions
* Dynamic route visualization on map

### 🚨 Emergency Intelligence

* Emergency alerts dashboard
* Smart emergency routing
* Flood / traffic / weather awareness
* Faster emergency access recommendations

### 🤖 AI Smart Recommendations

* AI-generated city recommendations
* Sustainable route suggestions
* Smart mobility insights
* Context-aware transit assistance

### 📍 Nearby Critical Infrastructure

* Hospitals
* Transit stations
* Schools / shelters
* Community locations

### 📈 Predictive Urban Intelligence

Powered by **IBM Granite Time Series**

UrbanFlow predicts:

* Future traffic trends
* Transit efficiency changes
* Urban disruption risk
* Smart city conditions for upcoming hours

Instead of only reacting to urban problems, UrbanFlow helps cities **predict disruptions before they happen**.

---

## 🧠 Problem Statement

Urban areas face major challenges such as:

* Traffic congestion
* Delayed emergency response
* Poor transit efficiency
* Limited real-time city intelligence
* Lack of predictive urban planning

Most systems only react after problems occur.

**UrbanFlow introduces predictive urban intelligence** by combining real-time monitoring with AI forecasting.

---

## 💡 Solution

UrbanFlow creates a centralized smart-city platform that:

1. Monitors live city conditions
2. Provides optimized routes using Google Maps
3. Displays nearby emergency infrastructure
4. Generates AI-powered recommendations
5. Predicts future city disruptions using IBM Granite Time Series

---

## 🏗️ Tech Stack

### Frontend

* Next.js
* React
* Tailwind CSS
* Framer Motion
* React Leaflet

### Backend

* FastAPI
* Python
* REST APIs

### APIs & Services

* Google Maps API (Routing & Directions)
* Geoapify API (Places & Infrastructure)
* Open-Meteo API (Weather)
* Groq API (AI Recommendations)
* IBM Granite Time Series (Predictive Forecasting)

### Database

* Supabase
* PostgreSQL

---

## 🧩 System Architecture

```text
Frontend (Next.js)
        ↓
FastAPI Backend
        ↓
 ┌─────────────────────────┐
 | Google Maps API         |
 | Geoapify API            |
 | Open-Meteo Weather API  |
 | Groq AI                 |
 | IBM Granite Time Series |
 └─────────────────────────┘
        ↓
Supabase Database
```

---

## 🔥 Key Highlights

✅ Real-time Smart City Dashboard
✅ AI-Powered Urban Recommendations
✅ Google Maps Route Optimization
✅ Transit Route Planning
✅ Emergency Infrastructure Mapping
✅ Predictive Urban Analytics
✅ IBM Technology Integration

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/akash-gupta04/urbanflow.git
cd urbanflow
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
GOOGLE_MAPS_API_KEY=
GROQ_API_KEY=
GEOAPIFY_API_KEY=
HF_TOKEN=
DATABASE_URL=
```

Run backend:

```bash
uvicorn main:app --reload
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📍 Future Improvements

* Real-time traffic prediction
* Live emergency responder tracking
* Multi-city forecasting
* Public transit disruption forecasting
* Smart congestion prevention
* IoT city sensor integration

---

## 👨‍💻 Team

**UrbanFlow Team**
IBM Z x UNSA Hackathon 2026

### Devpost Submission Link 
* Checkout Our Final Submission Along with the demo video here - https://devpost.com/software/urbanflow-gtxeoq
### Team Members

#### Akash Gupta

* GitHub: (https://github.com/akash-gupta04)
* LinkedIn: (https://www.linkedin.com/in/akash-gupta-6a447a237/)

#### Riken Patel

* GitHub: (https://github.com/RikenMor001)
* LinkedIn: (https://www.linkedin.com/in/riken-patel-188b762aa/)



---

## 📜 License

This project is built for educational and hackathon purposes.
