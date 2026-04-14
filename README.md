# 🚦 Control Grid Command Center (Smart Highway Platform)

An AI-powered smart highway monitoring and management platform built specifically for the **Code Ninjas Hackzion** hackathon. This application serves as a dynamic, real-time command center optimized for diagnosing, monitoring, and triaging highway infrastructure networks seamlessly.

![Dashboard Preview](https://via.placeholder.com/1200x600.png?text=Smart+Highway+Command+Center)

---

## ✨ Cutting-Edge Capabilities

We escalated this from a standard traffic application into a high-end enterprise **Command Center**, utilizing advanced frameworks entirely:

- 🎮 **3D Authenticated Immersion** — High-end `react-three-fiber` interactive 3D topology map during authentication sequences, offering a modern, premium UX for signing in (simulated OAuth available).
- 🌐 **Edge Node Hardware Matrix** — The dashboard actively pings the FastAPI backend via REST loops to fetch real-time toll grid data, network latency, system uptime, and active sensor states dynamically assigned to specific sectors (Alpha, Bravo, Charlie, Delta).
- 🧠 **Multimodal RAG AI Diagnostic Engine** — A hyper-advanced diagnostic terminal on the `/ai` route. It features token-by-token server-sent events (SSE) streaming and parses both uploaded Text Documents **and Images** (powered by `Llama-11b Vision`). 
- 🗣️ **Voice-to-Text Recognition** — Built-in native Web Speech API bindings let you dictate commands to the AI Engine hands-free, auto-disengaging efficiently upon transmission.
- 🌍 **Multilingual Localization Architecture** — The application enforces language contexts dynamically. The AI engine itself is instructed to adopt the interface's language (Spanish, English, Hindi, Kannada) for localized diagnostics.
- 🎫 **Presentational Ticketing Simulator** — Support tickets automatically scale into the `/tickets` routing board to display an enterprise IT infrastructure workflow environment.

---

## 🏗️ Technical Topology

```text
Code_Ninjas_Hackzion/
├── smart-highway-dashboard/     # Next.js 14 frontend (Command Center Application)
│   ├── app/                     # App router pages (dashboard/, ai/, tickets/, login/)
│   ├── components/              # EdgeMatrix UI, RagTerminal, Three Fiber Scenes, SVGs
│   ├── context/                 # Centralized React States (Context overrides)
│   └── tailwind.config.ts       # Glassmorphism/Neumorphism design tokens
│
├── backend/                     # Python FastAPI High-Performance Backend
│   ├── main.py                  # API endpoints, Live Telemetry Streamers
│   ├── rag_pipeline.py          # Vision LLM logic, ChromaDB document embeddings
│   ├── ml_models.py             # Heuristics & Analytics
```

---

## 🚀 Deployment Instructions

### 1. Launching the Backend Engine

```bash
# Enter environment & initialize
cd backend
python -m venv venv
venv\Scripts\activate           # Windows
source venv/bin/activate        # Linux/macOS

# Inject Dependencies
pip install -r requirements.txt

# Start Edge Node Server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*API mounts locally at `http://localhost:8000`. Full OpenAPI docs at `/docs`.*

### 2. Launching the Next.js Command Center

```bash
cd smart-highway-dashboard

# Install React/Three.js ecosystem dependencies
npm install

# Start Local Dev Rendering Engine
npm run dev
```
*Frontend interface mounts locally at `http://localhost:3000`. Navigate here to experience the 3D Auth screen.*

---

## ⚙️ Core Integrations

| Feature | Infrastructure Used |
|---|---|
| **Frontend Renderer** | **Next.js 14**, React 18, TailwindCSS |
| **Backend Endpoints** | **FastAPI**, Uvicorn, Python 3 |
| **Vector DB / RAG** | **ChromaDB**, LangChain, Groq Inference API |
| **UI Aesthetics** | **Recharts**, Framer-Motion, Lucide, React-Three-Fiber |

> "Control Grid provides an authoritative layer over massive highway infrastructure."
