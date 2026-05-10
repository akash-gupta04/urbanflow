# 🌆 UrbanFlow

> **AI-Powered Smart City Infrastructure for Sustainable Urban Living**

UrbanFlow is an AI-driven smart city platform focused on sustainable transportation, emergency response, urban accessibility, and climate-conscious infrastructure.

Built for the **IBM Z × UNSA Sheridan Hackathon 2026**, UrbanFlow leverages enterprise technologies, cloud computing, and artificial intelligence to address real-world urban challenges aligned with the **United Nations Sustainable Development Goals (UN SDGs).**

---

# 🚀 Vision

Modern cities face increasing challenges:

* Traffic congestion
* Climate impact
* Emergency response inefficiencies
* Accessibility barriers
* Urban infrastructure strain

UrbanFlow aims to provide a centralized AI-powered platform that improves:

* Sustainable transportation
* Smart emergency response
* Urban accessibility
* Real-time city insights
* Climate-conscious decision making

---

# 🌍 SDGs Targeted

UrbanFlow aligns with the following UN Sustainable Development Goals:

| SDG        | Goal                                    |
| ---------- | --------------------------------------- |
| 🏙️ SDG 11 | Sustainable Cities and Communities      |
| 🌱 SDG 13  | Climate Action                          |
| 🏗️ SDG 9  | Industry, Innovation and Infrastructure |
| 🏥 SDG 3   | Good Health and Well-Being              |
| ⚖️ SDG 10  | Reduced Inequalities                    |
| 🤝 SDG 17  | Partnerships for the Goals              |

---

# ✨ Core Features

## 🗺️ Smart Transit System

* AI-powered route suggestions
* Sustainable transportation recommendations
* Carbon-conscious travel insights
* Smart city map visualization

## 🚨 Emergency Response Mode

* Nearby hospitals and shelters
* Disaster-safe route guidance
* Emergency alerts visualization
* Rapid emergency assistance workflows

## 🤖 AI Civic Assistant

* AI-powered urban assistant
* Sustainability recommendations
* Emergency guidance
* Accessibility support
* Multilingual interaction

## 📊 Sustainability Dashboard

* CO₂ reduction analytics
* Transportation insights
* Smart city metrics
* Urban infrastructure statistics

## ♿ Accessibility Features

* Simplified user experience
* Multilingual support
* Low-bandwidth accessibility mode
* Inclusive urban assistance

---

# 🏗️ System Architecture

```txt
User
   ↓
Next.js Frontend
   ↓
Leaflet.js Smart City Maps
   ↓
FastAPI Backend APIs
   ↓
AI Layer
(IBM watsonx.ai + OpenAI)
   ↓
PostgreSQL Database
   ↓
IBM Cloud Infrastructure
   ↓
IBM Z Enterprise Architecture Layer
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* TypeScript
* TailwindCSS
* Leaflet.js
* OpenStreetMap

## Backend

* FastAPI
* Python
* SQLAlchemy

## Database

* PostgreSQL
* Supabase

## AI Stack

* IBM watsonx.ai
* OpenAI API
* Hugging Face (optional)

## IBM Technologies

* IBM Cloud
* IBM Z Enterprise Architecture

## Deployment

* Vercel
* Render / IBM Cloud

---

# 📂 Project Structure

```txt
urbanflow/
│
├── frontend/          # Next.js frontend
├── backend/           # FastAPI backend
├── docs/              # Architecture & presentation assets
├── README.md
└── .gitignore
```

---

# ⚡ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/urbanflow.git
cd urbanflow
```

---

# 🖥️ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

---

# ⚙️ Backend Setup

## Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Mac/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Run Backend

```bash
uvicorn main:app --reload
```

Backend runs on:

```txt
http://127.0.0.1:8000
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
DATABASE_URL=your_postgresql_url
OPENAI_API_KEY=your_openai_key
WATSONX_API_KEY=your_watsonx_key
```

---

# 🧠 IBM Integration

UrbanFlow incorporates IBM technologies to simulate enterprise-grade smart city infrastructure.

## IBM watsonx.ai

Used for:

* AI-powered civic assistance
* Emergency response workflows
* Sustainability recommendations
* Natural language interaction

## IBM Cloud

Used for:

* Cloud deployment
* Scalable infrastructure
* Backend hosting

## IBM Z

UrbanFlow is architected with IBM Z-inspired enterprise principles:

* High availability
* Secure transaction processing
* Scalable urban analytics
* Mission-critical infrastructure reliability

---

# 📸 Future Scope

* Real-time public transit APIs
* Predictive congestion analytics
* Disaster forecasting
* IoT smart city integrations
* AI-powered traffic optimization
* Citizen reporting system
* Real-time sustainability tracking

---

# 👨‍💻 Team

Built with passion during the IBM Z × UNSA Sheridan Hackathon 2026.

---

# 📜 License

This project is developed for educational and hackathon purposes.

---

# 🌟 UrbanFlow

> *Smarter Cities. Sustainable Futures.*
