<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Hireonomous: Autonomous Hiring Intelligence

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)
![React 19](https://img.shields.io/badge/React-19-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green.svg)

**Hireonomous** is a production-ready, autonomous hiring intelligence platform designed to streamline candidate evaluation, communication, and pipeline management. By combining AI-driven voice interactions, intelligent resume parsing, and automated outreach, Hireonomous allows recruitment teams to operate at scale while maintaining a personalized candidate experience.

---

## ✨ Key Features

- **🤖 Autonomous AI Voice Screening:** Integrates with Bolna & Twilio to conduct automated initial phone screens, transcribing and evaluating candidate responses in real time.
- **📄 Intelligent Resume Parsing:** Uses PyMuPDF and LLMs (OpenAI/OpenRouter) to automatically extract skills, experience, and key metrics from uploaded resumes.
- **📊 Real-Time Analytics Dashboard:** A cinematic, high-density React frontend that displays live mission telemetry, pipeline stages, and suite-level execution artifacts.
- **📧 Automated Outreach:** Built-in SMTP support for sending automated assessment links and follow-ups to candidates.
- **📈 Comprehensive Reporting:** Generates multi-sheet Excel reports detailing candidate analytics and pipeline progress.
- **💼 Job Board Integration:** Automated posting and sourcing capabilities.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Lucide React (Icons)
- **Data Visualization:** Recharts
- **Language:** TypeScript

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB (via Motor/PyMongo async)
- **AI/ML Integration:** Bolna API, OpenAI API, OpenRouter, Faster-Whisper
- **Document Processing:** PyMuPDF, Python-docx, OpenPyXL

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (3.11+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env.local` file in the `backend` directory with the following variables:
   ```env
   # Database
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority"
   MONGODB_DB="voiceai"

   # AI / LLM Providers
   OPENAI_API_KEY="your-openai-api-key"
   OPENROUTER_API_KEY="your-openrouter-key"
   
   # Voice AI (Bolna)
   BOLNA_AGENT_ID="your-bolna-agent-id"
   BOLNA_API_KEY="your-bolna-api-key"

   # Email (SMTP)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   SMTP_USE_TLS=true
   ```

5. **Start the FastAPI server:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
   ```
   *The backend will be available at `http://localhost:8001` and interactive docs at `http://localhost:8001/docs`.*

### 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

---

## 📂 Project Structure

```text
Hireonomous/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI Routes (Resume, Voice, Email, etc.)
│   │   ├── core/         # Config, Database setup
│   │   ├── models/       # Pydantic & DB schemas
│   │   └── services/     # Business logic (Voice processing, Reporting)
│   ├── requirements.txt  # Python dependencies
│   └── main.py           # Application entry point
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components (Tables, Charts, Cards)
    │   ├── views/        # Page level components (Dashboard, Hiring, etc.)
    │   ├── services/     # Axios API integrations
    │   └── types.ts      # TypeScript interfaces
    ├── package.json      # Node dependencies
    └── vite.config.ts    # Vite configuration
```

---

## 📖 How It Works

1. **Sourcing & Parsing:** Upload candidate resumes via the dashboard. The backend parses the PDF/Word docs using `PyMuPDF` and uses an LLM to extract structured data (skills, experience).
2. **Automated Screening:** Initiate an AI voice call to the candidate. The system leverages Bolna to act as the AI interviewer, reading from dynamically generated scripts based on the parsed resume.
3. **Evaluation & Reporting:** After the call, the AI evaluates the response, assigns a score, and updates the pipeline status on the dashboard. You can export detailed multi-sheet Excel reports of your pipeline.
4. **Follow-up:** Automated emails can be dispatched to notify candidates of next steps or rejections.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps to contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.