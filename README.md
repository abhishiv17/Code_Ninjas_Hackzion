# 🛣️ OmniSolve: Smart Highway AI Assistant

> **AI-Powered Intelligent Ticket Routing & Resolution Agent**  
> Bridging the IT/OT Knowledge Gap in Smart Infrastructure

[![Status](https://img.shields.io/badge/Status-Active-green)](#) [![Python](https://img.shields.io/badge/Python-3.13-blue)](#) [![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009485)](#) [![Groq](https://img.shields.io/badge/LLM-Groq-black)](#)

---

## 🎯 Why This Project?

In modern Smart Highway systems, field engineers face a critical **"Knowledge Gap"** between:
- **Physical Infrastructure (OT):** Sensors, controllers, power systems
- **Digital Management Systems (IT):** APIs, databases, monitoring dashboards

**OmniSolve** eliminates this gap by providing **instant, AI-powered solutions** that combine:
- 📚 **Technical Knowledge:** 505+ PDF segments of infrastructure protocols
- 🧠 **Intelligent AI:** Groq LLM + Machine Learning models
- ⚡ **Real-time Insights:** Root cause prediction + anomaly detection

**Impact:** Reduces Mean Time To Resolution (MTTR) from hours to minutes, potentially saving lives and infrastructure damage.

---

## ✨ Key Features

### 🤖 Three-Tier AI System

| Tier | Technology | Purpose | Speed |
|------|-----------|---------|-------|
| **1. Intelligent Analysis** | Groq Mixtral LLM | Analyzes ticket descriptions | 500-3000ms |
| **2. Root Cause Prediction** | RandomForest ML | Identifies root cause | 5-50ms ⚡ |
| **3. Anomaly Detection** | Isolation Forest ML | Detects abnormal readings | 1-10ms ⚡⚡ |

### 🎆 Full-Stack Features

✅ **RAG System** - ChromaDB vector store with 505+ curated PDF segments  
✅ **LLM Integration** - Groq Mixtral for intelligent analysis  
✅ **ML Models** - Loaded at startup, zero-latency predictions  
✅ **FastAPI Backend** - 3 intelligent endpoints  
✅ **Next.js Dashboard** - Real-time monitoring UI  
✅ **Interactive Docs** - Swagger UI for API exploration  
✅ **Environment-Safe** - Secure API key management  
✅ **Graceful Fallbacks** - Works even with API outages  

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│              smart-highway-dashboard/                       │
│         Real-time monitoring & ticket submission            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/JSON
┌────────────────────▼────────────────────────────────────────┐
│                  BACKEND API (FastAPI)                      │
│                 http://127.0.0.1:8001                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  POST /analyze ────────► Groq LLM Analysis           │   │
│  │  POST /predict-root-cause ──► ML Root Cause (RF)    │   │
│  │  POST /detect-anomaly ──► ML Anomaly (IsoForest)    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │ Groq   │  │ ML     │  │ ChromaDB │
    │ LLM    │  │ Models │  │ RAG      │
    │(API)   │  │(Memory)│  │Database  │
    └────────┘  └────────┘  └──────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.13+
- Node.js 18+ (for frontend)
- Groq API Key (free tier available)

### 1️⃣ Backend Setup (AI Engine)

```bash
# Navigate to backend
cd backend

# Create .env file with your Groq API key
echo 'GROQ_API_KEY=gsk_your_key_here' > .env

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn main:app --reload --port 8001
```

**✅ Server running:** http://127.0.0.1:8001

### 2️⃣ Frontend Setup (Dashboard)

```bash
# Navigate to frontend
cd smart-highway-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

**✅ Dashboard running:** http://localhost:3000

### 3️⃣ Test the API

**Interactive API Docs:**
```
http://127.0.0.1:8001/docs
```

**PowerShell Test:**
```powershell
# Analyze a ticket
$body = @{ticket="sensor overheating detected"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://127.0.0.1:8001/analyze" `
  -Method POST -ContentType "application/json" -Body $body
```

---

## 📡 API Endpoints

### 🔵 POST `/analyze` - AI Ticket Analysis

Analyzes ticket descriptions using Groq LLM.

**Request:**
```json
{
  "ticket": "sensor overheating in lane 3 detection unit"
}
```

**Response:**
```json
{
  "type": "Hardware",
  "solution": "Replace overheating sensor and check cooling system",
  "confidence": 0.92
}
```

---

### 🟢 POST `/predict-root-cause` - ML Root Cause Prediction

Predicts root cause from symptom description.

**Request:**
```json
{
  "description": "sensor timeout api error"
}
```

**Response:**
```json
{
  "root_cause": "software_timeout",
  "confidence": 0.87
}
```

**Possible Root Causes:**
- `fuse_failure` - Electrical/power issues
- `software_timeout` - API/communication errors
- `power_failure` - Complete power loss
- `relay_fault` - Relay/switch malfunction

---

### 🟡 POST `/detect-anomaly` - Anomaly Detection

Detects abnormal temperature and voltage readings.

**Request:**
```json
{
  "temperature": 35.5,
  "voltage": 215
}
```

**Response:**
```json
{
  "status": "anomaly"
}
```

**Normal Ranges:**
- Temperature: 39-42°C
- Voltage: 219-222V

---

## 📁 Project Structure

```
Code_Ninjas_Hackzion/
│
├── 📄 README.md (this file)
├── 📄 .env (your Groq API key - create this)
│
├── 🔙 backend/
│   ├── main.py                 # FastAPI app with 3 endpoints
│   ├── ai_engine.py            # Groq LLM integration
│   ├── ml_models.py            # ML models (RF + IsoForest)
│   ├── requirements.txt         # Python dependencies
│   │
│   ├── 📚 Documentation:
│   ├── QUICKSTART.md           # 2-step setup guide
│   ├── API_TESTING_GUIDE.md    # Testing endpoints
│   ├── REFACTORING_SUMMARY.md  # Technical overview
│   ├── ARCHITECTURE.md         # System design
│   ├── STRUCTURE_CHANGES.md    # What changed
│   └── FINAL_SUMMARY.md        # Complete reference
│
├── 🎨 frontend/
│   ├── Next.js dashboard
│   ├── Real-time ticket monitoring
│   └── RAG terminal integration
│
├── 🛣️ smart-highway-dashboard/
│   ├── Next.js App Router
│   ├── Tailwind CSS v4
│   ├── RAG Terminal component
│   └── API integration
│
├── 📊 brains.py               # RAG system (ChromaDB)
└── 📡 api.py                  # Legacy API (root directory)
```

---

## 🛠️ Technology Stack

### Backend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | FastAPI | REST API server |
| **LLM** | Groq Mixtral 8x7b | Intelligent analysis |
| **ML Models** | scikit-learn | Root cause + anomaly detection |
| **Vector DB** | ChromaDB | RAG knowledge base |
| **Embeddings** | Sentence Transformers | PDF chunking |
| **Language** | Python 3.13 | Backend runtime |

### Frontend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 13+ | React app |
| **Styling** | Tailwind CSS v4 | UI components |
| **Language** | TypeScript | Type safety |
| **API Client** | Fetch API | Backend communication |

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```bash
# Groq API Key (required for /analyze endpoint)
# Get free key: https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_api_key_here
```

**Without this key:**
- ✅ `/predict-root-cause` still works (ML model)
- ✅ `/detect-anomaly` still works (ML model)
- ⚠️ `/analyze` returns fallback response (keyword-based)

---

## 🚦 Current Progress

| Feature | Status | Details |
|---------|--------|---------|
| PDF Data Extraction | ✅ Complete | 505+ segments processed |
| Vector Embeddings | ✅ Complete | ChromaDB indexed |
| LLM Connection | ✅ Complete | Groq Mixtral integrated |
| ML Root Cause Model | ✅ Complete | RandomForest trained |
| ML Anomaly Detection | ✅ Complete | IsolationForest deployed |
| FastAPI Backend | ✅ Complete | 3 endpoints live |
| Frontend Dashboard | ✅ Complete | Next.js + Tailwind |
| Interactive Docs | ✅ Complete | Swagger at /docs |
| Graceful Fallbacks | ✅ Complete | API outage safe |

---

## 💡 How to Use

### For Field Engineers

1. **Submit Issue:** Use dashboard to describe infrastructure problem
2. **Get Solution:** AI provides instant analysis + root cause
3. **Check Anomalies:** Monitor sensor readings for abnormalities
4. **Take Action:** Follow recommended solutions

### For Developers

**Test Root Cause Prediction:**
```bash
cd backend
python
```

```python
from ml_models import predict_root_cause
result = predict_root_cause("sensor timeout api error")
print(result)  # ("software_timeout", 0.87)
```

**Test Anomaly Detection:**
```python
from ml_models import detect_anomaly
status = detect_anomaly(35.5, 215)
print(status)  # "anomaly"
```

---

## 📊 Performance Metrics

| Endpoint | Response Time | Model Type | Reliability |
|----------|--------------|-----------|------------|
| `/analyze` | 500-3000ms | Groq LLM (API) | Graceful fallback |
| `/predict-root-cause` | 5-50ms | ML in-memory | 100% |
| `/detect-anomaly` | 1-10ms | ML in-memory | 100% |

**Why ML endpoints are instant:**
- Models loaded at server startup
- In-memory (no disk I/O)
- Pure CPU inference (microseconds)

---

## 🔧 Development

### Adding New Features

1. **New ML Model?** → Edit `backend/ml_models.py`
2. **New API Endpoint?** → Edit `backend/main.py`
3. **New Dashboard Page?** → Add component to `frontend/app/`
4. **New RAG Knowledge?** → Add PDFs and reprocess `brains.py`

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd smart-highway-dashboard
npm test
```

---

## 📚 Documentation

Comprehensive guides in `backend/`:

- **[QUICKSTART.md](backend/QUICKSTART.md)** - 2-step setup
- **[API_TESTING_GUIDE.md](backend/API_TESTING_GUIDE.md)** - API examples
- **[REFACTORING_SUMMARY.md](backend/REFACTORING_SUMMARY.md)** - Technical deep-dive
- **[ARCHITECTURE.md](backend/ARCHITECTURE.md)** - System design
- **[STRUCTURE_CHANGES.md](backend/STRUCTURE_CHANGES.md)** - File organization

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is part of Code Ninjas Hackzion 2026.

---

## 🔗 Quick Links

- 🌐 **API Docs:** http://127.0.0.1:8001/docs
- 🎨 **Dashboard:** http://localhost:3000
- 🔑 **Get Groq Key:** https://console.groq.com/keys
- 📖 **Backend Guides:** `backend/` directory
- 🧠 **RAG System:** `brains.py`

---

## ⚡ Key Improvements (Recent Updates)

✅ **Switched to Groq LLM** - Faster inference, free tier available  
✅ **ML Model Caching** - Models load at startup (zero delay)  
✅ **3 Intelligent Endpoints** - Analysis + Prediction + Anomaly  
✅ **Full Documentation** - 6 comprehensive guides  
✅ **Production Ready** - Error handling + fallbacks  
✅ **Interactive API Docs** - Test endpoints directly  

---

## 🎓 What's Next?

- [ ] Deploy to production (AWS/GCP)
- [ ] Add real-time notifications
- [ ] Expand ML training data
- [ ] Mobile app for field engineers
- [ ] Advanced analytics dashboard
- [ ] Historical ticket analytics

---

## 📧 Support

For issues or questions:
1. Check documentation in `backend/`
2. Review API docs at `/docs`
3. Check existing issues/discussions
4. Open a new issue with details

---

**Built with ❤️ for Smart Infrastructure**  
*Reducing MTTR. Saving infrastructure. Saving lives.*
