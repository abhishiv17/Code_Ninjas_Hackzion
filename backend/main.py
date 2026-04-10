<<<<<<< HEAD
import time
import os
import random
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from database import get_db, init_db
from auth import verify_password, get_password_hash, create_access_token, decode_access_token
from ai_engine import analyze_ticket_with_ai


# Initialize DB on startup
init_db()

app = FastAPI(title="OmniSolve AI Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ─── Location Tracking (REST) ─────────────────────────────────
active_users = {}

class LocationRequest(BaseModel):
    id: str
    name: str
    lat: float
    lng: float

@app.post("/api/location")
async def update_location(req: LocationRequest):
    active_users[req.id] = {
        "id": req.id,
        "name": req.name,
        "lat": req.lat,
        "lng": req.lng,
        "timestamp": time.time()
    }
    
    # Clean up stale users (inactive for > 30s)
    current_time = time.time()
    stale_ids = [uid for uid, data in active_users.items() if current_time - data["timestamp"] > 30]
    for uid in stale_ids:
        del active_users[uid]
        
    return {"status": "success"}

@app.get("/api/locations")
async def get_locations():
    current_time = time.time()
    stale_ids = [uid for uid, data in active_users.items() if current_time - data["timestamp"] > 30]
    for uid in stale_ids:
        del active_users[uid]
    return list(active_users.values())

# ─── Sensors Data (Mock) ──────────────────────────────────────
# Generating mock sensors around Bangalore coordinates
SENSORS_DB = [
    {"id": f"S-{i:03d}", "name": f"Node {i}", "lat": 12.9716 + random.uniform(-0.06, 0.06), "lng": 77.5946 + random.uniform(-0.06, 0.06), "status": "active"} 
    for i in range(1, 16)
]

@app.get("/api/sensors")
async def get_sensors():
    # Simulate dynamic IoT reality: 10% chance a sensor flips state when polled
    for s in SENSORS_DB:
        if random.random() < 0.1:
            s["status"] = "faulty" if s["status"] == "active" else "active"
    return SENSORS_DB

# ─── Pydantic Models ──────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TicketRequest(BaseModel):
    description: str

# ─── Auth Dependency ──────────────────────────────────────────
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

# ─── Endpoints ───────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "OmniSolve AI API v2 is running!"}

@app.get("/api/health")
async def health():
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    ai_mode = "google" if gemini_key else "offline"
    return {"status": "ok", "ai_mode": ai_mode}

@app.post("/api/signup")
async def signup(req: SignupRequest):
    with get_db() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered.")
        hashed = get_password_hash(req.password)
        conn.execute(
            "INSERT INTO users (name, email, hashed_password) VALUES (?, ?, ?)",
            (req.name, req.email, hashed)
        )
        conn.commit()
    return {"message": "Account created successfully. You can now log in."}

@app.post("/api/login")
async def login(req: LoginRequest):
    with get_db() as conn:
        user = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token({"sub": user["email"], "name": user["name"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/me")
async def me(user=Depends(get_current_user)):
    return {"email": user["sub"], "name": user.get("name", "")}

@app.post("/api/ticket")
async def create_ticket(req: TicketRequest, user=Depends(get_current_user)):
    start = time.time()
    result = analyze_ticket_with_ai(req.description)
    elapsed = round(time.time() - start, 2)

    ai_mode = "google" if os.getenv("GEMINI_API_KEY", "") else "offline"
    report = f"Type: {result.get('type', 'Unknown')}\n\nSolution: {result.get('solution', 'N/A')}\n\nConfidence: {int(result.get('confidence', 0) * 100)}%"

    with get_db() as conn:
        conn.execute(
            "INSERT INTO tickets (description, ai_mode, elapsed_seconds, diagnostic_report, user_email) VALUES (?, ?, ?, ?, ?)",
            (req.description, ai_mode, elapsed, report, user["sub"])
        )
        conn.commit()

    return {
        "diagnostic_report": report,
        "elapsed_seconds": elapsed,
        "ai_mode": ai_mode,
        "confidence": result.get("confidence", 0),
        "type": result.get("type", "Unknown"),
    }

@app.get("/api/tickets")
async def get_tickets(user=Depends(get_current_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM tickets WHERE user_email = ? ORDER BY created_at DESC LIMIT 20",
            (user["sub"],)
        ).fetchall()
    return [dict(r) for r in rows]

=======
import json
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_engine import analyze_ticket_with_ai

# Initialize FastAPI app
app = FastAPI(
    title="OmniSolve AI Backend",
    description="A simple AI-powered ticket analysis API",
    version="1.0.0"
)

# Configure CORS
# This allows your frontend (e.g., Next.js running on localhost:3000) to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# 1. Define the Expected Input Data Structure
class TicketRequest(BaseModel):
    ticket: str

# 2. Define the Expected Output Data Structure
class AnalysisResponse(BaseModel):
    type: str
    solution: str
    confidence: float

# 3. Create the Endpoint
@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_ticket(request: TicketRequest):
    """
    Receives a ticket description and returns an AI-generated analysis 
    containing the issue type, a solution, and a confidence score.
    """
    # Simply pass the ticket string to our AI engine
    result = analyze_ticket_with_ai(request.ticket)
    
    # Return the dictionary properly structured, ensuring unicode isn't escaped
    return Response(content=json.dumps(result, ensure_ascii=False), media_type="application/json")

# Simple root endpoint to verify the server is running
@app.get("/")
async def root():
    return {"message": "OmniSolve AI API is running! Use POST /analyze to analyze tickets."}
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22
