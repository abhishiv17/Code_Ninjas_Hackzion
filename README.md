# 🚦 Control Grid Command Center

> **AI-Powered Smart Highway Management Platform** — built for the **Code Ninjas Hackzion** hackathon.

An enterprise-grade command center for diagnosing, monitoring, and triaging highway infrastructure networks in real time, powered by multi-modal AI (Vision + RAG), Auth0 SSO, and a live data streaming pipeline.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🔐 **Auth0 Enterprise SSO** | Universal Login via Auth0 OAuth2 — secure, zero-password sign-in |
| 📡 **Live Telemetry Streaming** | Server-Sent Events (SSE) stream real-time toll metrics every 2 seconds |
| 🧠 **Multi-modal AI Diagnostics** | Vision RAG powered by `llama-3.2-11b-vision-preview` (images + text) |
| 🎫 **AI-Triaged Ticketing** | New tickets are automatically triaged by LLM — severity, tags, routing |
| 🌍 **Multilingual Support** | Full localization: English, Spanish, Hindi, Kannada |
| 🗄️ **Persistent Database** | SQLAlchemy ORM backed by SQLite (local) or PostgreSQL (production) |
| 🐳 **Docker Compose** | One-command spinup of the full stack (Frontend + Backend + Postgres) |
| 🔄 **GitHub Actions CI/CD** | Automated linting and build checks on every push |

---

## 🏗️ Project Structure

```
Code_Ninjas_Hackzion/
├── smart-highway-dashboard/     # Next.js 16 Frontend (App Router)
│   ├── app/                     # Pages: dashboard, monitoring, tickets, ai, login
│   ├── components/              # LiveMonitoring, TicketAnalysis, SlidePanel, etc.
│   ├── context/                 # AppContext (Auth0 + Postgres state sync)
│   ├── lib/                     # auth0.ts (Auth0Client init)
│   ├── proxy.ts                 # Next.js 16 Proxy (Auth0 middleware)
│   ├── .env.local.example       # ← Copy this to .env.local
│   └── Dockerfile
│
├── backend/                     # FastAPI Python Backend
│   ├── main.py                  # REST API + SSE telemetry + Postgres CRUD
│   ├── ai_engine.py             # Groq LLM integration (Vision + Triage)
│   ├── rag_pipeline.py          # ChromaDB RAG document search
│   ├── ml_models.py             # ML heuristics (anomaly detection, urgency)
│   ├── database.py              # SQLAlchemy engine (SQLite/Postgres)
│   ├── models.py                # DB Models: User, Ticket
│   ├── requirements.txt
│   ├── .env.example             # ← Copy this to .env
│   └── Dockerfile
│
├── docker-compose.yml           # Full stack orchestration
├── .github/workflows/main.yml   # CI/CD pipeline
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.10+
- A free [Auth0 account](https://auth0.com/)
- A free [Groq API key](https://console.groq.com/)

### Step 1 — Clone & Configure

```bash
git clone https://github.com/abhishiv17/Code_Ninjas_Hackzion.git
cd Code_Ninjas_Hackzion
```

**Backend environment:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

**Frontend environment:**
```bash
cd smart-highway-dashboard
cp .env.local.example .env.local
# Edit .env.local and add your Auth0 credentials (see Auth0 Setup below)
```

### Step 2 — Auth0 Setup

1. Go to [manage.auth0.com](https://manage.auth0.com) → Create App → **Regular Web Application**
2. In App Settings, set:
   - **Allowed Callback URLs**: `http://localhost:3000/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
3. Copy **Domain**, **Client ID**, **Client Secret** into your `.env.local`

### Step 3 — Run the Stack

**Terminal 1 — Backend API:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# → Running on http://localhost:8000
# → API docs at http://localhost:8000/docs
```

**Terminal 2 — Frontend:**
```bash
cd smart-highway-dashboard
npm install
npm run dev
# → Running on http://localhost:3000
```

---

## 🐳 Docker Compose (Optional — Full Stack)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up -d
# Starts: Frontend (3000), Backend (8000), PostgreSQL (5432)
```

For Postgres mode, set in `backend/.env`:
```
DATABASE_URL=postgresql://admin:admin123@postgres:5432/smarthighway
```

---

## 🔧 Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Auth | @auth0/nextjs-auth0 v4 (Universal SSO) |
| Styling | Tailwind CSS v4 |
| State | React Context API → synced to FastAPI |
| 3D Engine | Three.js / React Three Fiber |
| Charts | Recharts |
| Animations | Framer Motion |

### Backend
| Layer | Technology |
|---|---|
| API Engine | FastAPI + Uvicorn |
| Database | SQLAlchemy ORM → SQLite (dev) / PostgreSQL (prod) |
| AI / LLM | Groq API: `llama-3.1-8b-instant`, `llama-3.2-11b-vision-preview` |
| Vector Search | ChromaDB (RAG pipeline) |
| Streaming | Server-Sent Events (SSE) |
| ML | Scikit-Learn (anomaly + urgency detection) |

### DevOps
| Layer | Technology |
|---|---|
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Hosting | Vercel (frontend) / Render (backend) |

---

## 🌐 Environment Variables Reference

### `smart-highway-dashboard/.env.local`

```env
AUTH0_SECRET=                  # 32+ char random string
AUTH0_BASE_URL=                # http://localhost:3000
AUTH0_ISSUER_BASE_URL=         # https://your-tenant.us.auth0.com
AUTH0_CLIENT_ID=               # From Auth0 App Settings
AUTH0_CLIENT_SECRET=           # From Auth0 App Settings
```

### `backend/.env`

```env
GROQ_API_KEY=                  # From console.groq.com
DATABASE_URL=                  # sqlite:///./smarthighway.db (default)
```

---

> *"Control Grid provides an authoritative layer over massive highway infrastructure."*
