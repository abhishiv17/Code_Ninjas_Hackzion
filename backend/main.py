import sys, os
from datetime import datetime, timedelta
from typing import Optional, Dict

sys.path.insert(0, os.path.dirname(__file__))
from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
from jose import JWTError, jwt
from ai_engine import analyze_ticket_with_ai, triage_with_ai
from ml_models import predict_root_cause, detect_anomaly, predict_urgency
from feedback import save_feedback
from supabase import create_client, Client
from database import engine, get_db
import models
from sqlalchemy.orm import Session

# Create database tables automatically
models.Base.metadata.create_all(bind=engine)

SECRET_KEY = os.getenv("SECRET_KEY", "dev-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ACCESS_TOKEN_EXPIRE_MINUTES = 30

USERS_DB: Dict[str, Dict] = {
    "demo@example.com": {
        "name": "Demo User",
        "email": "demo@example.com",
        "hashed_password": bcrypt.hashpw("Demo@1234".encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
        "created_at": datetime.utcnow().isoformat()
    }
}

app = FastAPI(title="SmartHighway OS", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class SignUpRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        return USERS_DB.get(email) if email else None
    except (JWTError, ValueError):
        return None

@app.post("/api/signup", response_model=AuthResponse)
async def signup(req: SignUpRequest):
    if req.email in USERS_DB:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    USERS_DB[req.email] = {
        "name": req.name,
        "email": req.email,
        "hashed_password": get_password_hash(req.password),
        "created_at": datetime.utcnow().isoformat()
    }
    
    access_token = create_access_token(data={"sub": req.email})
    user = {k: v for k, v in USERS_DB[req.email].items() if k != "hashed_password"}
    return {"access_token": access_token, "user": user}

@app.post("/api/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    if req.email not in USERS_DB:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = USERS_DB[req.email]
    if not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": req.email})
    user_data = {k: v for k, v in user.items() if k != "hashed_password"}
    return {"access_token": access_token, "user": user_data}

@app.get("/api/me")
async def get_me(current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {k: v for k, v in current_user.items() if k != "hashed_password"}

class TicketRequest(BaseModel):
    ticket: str

class AnalysisResponse(BaseModel):
    type: str
    solution: str
    confidence: float

class RootCauseRequest(BaseModel):
    description: str

class RootCauseResponse(BaseModel):
    root_cause: str
    confidence: float

class AnomalyRequest(BaseModel):
    temperature: float
    voltage: float

class AnomalyResponse(BaseModel):
    status: str

class FeedbackRequest(BaseModel):
    ticket_query: str
    solution_given: str
    was_successful: bool

class SolveTicketRequest(BaseModel):
    query: str
    image_base64: Optional[str] = None

class TriageRequest(BaseModel):
    title: str
    description: str
    image_base64: Optional[str] = None

class TicketCreate(BaseModel):
    title: str
    description: str
    status: str
    severity: str
    tollId: str
    image_base64: Optional[str] = None

class TriageResponse(BaseModel):
    severity: str
    tags: list
    assignedTo: str

@app.post("/api/triage-ticket", response_model=TriageResponse)
async def triage_ticket(req: TriageRequest):
    result = triage_with_ai(req.title, req.description, req.image_base64)
    return result

@app.post("/api/tickets")
async def create_db_ticket(req: TicketCreate, db: Session = Depends(get_db)):
    import uuid
    new_id = f"TKT-{uuid.uuid4().hex[:4].upper()}"
    triage = triage_with_ai(req.title, req.description, req.image_base64)
    
    db_ticket = models.Ticket(
        id=new_id,
        title=req.title,
        description=req.description,
        status="open",
        severity=triage.get("severity", req.severity),
        assigned_to=triage.get("assignedTo", "General SysOps"),
        toll_id=req.tollId,
        image_base64=req.image_base64
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.get("/api/tickets")
async def get_all_tickets(db: Session = Depends(get_db)):
    return db.query(models.Ticket).order_by(models.Ticket.created_at.desc()).all()

@app.put("/api/tickets/{ticket_id}/resolve")
async def resolve_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if ticket:
        ticket.status = "resolved"
        db.commit()
    return {"status": "success"}

@app.put("/api/tickets/{ticket_id}/assign")
async def assign_ticket(ticket_id: str, assign_req: dict, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if ticket:
        ticket.assigned_to = assign_req.get("user", "Unknown")
        db.commit()
    return {"status": "success"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_ticket(req: TicketRequest):
    return analyze_ticket_with_ai(req.ticket)

@app.post("/predict-root-cause", response_model=RootCauseResponse)
async def predict_root_cause_ep(req: RootCauseRequest):
    root_cause, conf = predict_root_cause(req.description)
    return {"root_cause": root_cause, "confidence": float(conf)}

@app.post("/detect-anomaly", response_model=AnomalyResponse)
async def detect_anomaly_ep(req: AnomalyRequest):
    return {"status": detect_anomaly(req.temperature, req.voltage)}

@app.post("/api/feedback")
async def submit_feedback(req: FeedbackRequest):
    result = save_feedback(req.ticket_query, req.solution_given, req.was_successful)
    return result

@app.post("/api/solve-ticket")
async def solve_ticket(req: SolveTicketRequest):
    try:
        result = analyze_ticket_with_ai(req.query, req.image_base64)
        return {
            "status": "success",
            "response": result.get("solution", f"Ticket type: {result.get('type', 'unknown')}")
        }
    except Exception as e:
        return {
            "status": "error",
            "response": "",
            "error": str(e)
        }

@app.get("/")
async def root():
    return {"status": "active"}

class DiagnosticsRequest(BaseModel):
    query: str
    history: list = []
    language: str = "en"
    image_base64: Optional[str] = None

class LiveMonitoringResponse(BaseModel):
    toll_id: int
    urgency_percentage: float
    timeseries: list
    active_vehicles: int
    latency: float
    sensors_online: int
    uptime: str

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase_client: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Failed to initialize Supabase: {e}")

from fastapi.responses import StreamingResponse
from rag_pipeline import query_rag_pipeline_stream

@app.post("/api/diagnostics")
async def handle_diagnostics(req: DiagnosticsRequest):
    return StreamingResponse(
        query_rag_pipeline_stream(req.query, req.history, req.language, req.image_base64),
        media_type="text/event-stream"
    )

class KnowledgeIngestRequest(BaseModel):
    document_text: str
    metadata: dict = {}

@app.post("/api/knowledge/ingest")
async def ingest_knowledge(req: KnowledgeIngestRequest):
    from rag_pipeline import add_knowledge
    try:
        add_knowledge(req.document_text, req.metadata)
        return {"status": "success", "message": "Document successfully vectorized and stored."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/live-monitoring/{toll_id}", response_model=LiveMonitoringResponse)
async def live_monitoring_data(toll_id: int):
    # Simulated current hardware state to feed into the model
    # Normally this would be retrieved from real-time Redis/IoT stream
    import random
    hardware_status = random.choice([0, 1])  # 0 offline, 1 online
    latency = random.uniform(10.0, 500.0)

    timeseries_data = []
    ticket_frequency = 0
    
    twelve_hours_ago = (datetime.utcnow() - timedelta(hours=12)).isoformat()

    if supabase_client:
        try:
            # Query Supabase timeseries data for IT tickets raised for this toll_id
            response = supabase_client.table("tickets").select("*").eq("toll_id", toll_id).gte("created_at", twelve_hours_ago).execute()
            if response.data:
                timeseries_data = [{"id": r.get("id"), "created_at": r.get("created_at"), "issue": r.get("description")} for r in response.data]
                ticket_frequency = len(timeseries_data)
        except Exception as e:
            print(f"Supabase query failed: {e}")
            # Fallback to mock data if there's an error
            pass
    
    # If no data or Supabase not initialized, mock something up for the dashboard
    if not timeseries_data:
        ticket_frequency = random.randint(0, 15)
        for i in range(ticket_frequency):
            timestamp = (datetime.utcnow() - timedelta(hours=random.uniform(0, 12))).isoformat()
            timeseries_data.append({
                "id": f"dummy-{i}",
                "created_at": timestamp,
                "issue": random.choice(["RFID Reader Offline", "Camera Glitching", "Network Timeout"])
            })
            
    # Predict urgency
    urgency = predict_urgency(ticket_frequency, hardware_status, latency)
    
    # Generate dynamic realistic metrics bound to the specific toll_id
    if hardware_status == 0:
        active_vehicles = 0
        sensors_online = 0
        uptime = "0.0%"
    else:
        # Pseudo-random but bound to toll_id to look realistic
        base_vehicles = 1200 * toll_id
        active_vehicles = base_vehicles + random.randint(-200, 200)
        sensors_online = random.randint(85, 100)
        uptime = "99.8%"

    return {
        "toll_id": toll_id,
        "urgency_percentage": urgency,
        "timeseries": timeseries_data,
        "active_vehicles": active_vehicles,
        "latency": latency,
        "sensors_online": sensors_online,
        "uptime": uptime
    }

@app.get("/api/live-monitoring-stream/{toll_id}")
async def live_monitoring_stream(toll_id: int):
    async def event_generator():
        import asyncio, json, random
        while True:
            hardware_status = random.choice([1, 1, 1, 0]) # mostly online
            latency = random.uniform(10.0, 500.0)
            ticket_frequency = random.randint(0, 15)
            urgency = predict_urgency(ticket_frequency, hardware_status, latency)
            
            if hardware_status == 0:
                active_vehicles = 0
                sensors_online = 0
                uptime = "0.0%"
            else:
                base_vehicles = 1200 * toll_id
                active_vehicles = base_vehicles + random.randint(-200, 200)
                sensors_online = random.randint(85, 100)
                uptime = "99.8%"

            data = {
                "toll_id": toll_id,
                "urgency_percentage": urgency,
                "active_vehicles": active_vehicles,
                "latency": latency,
                "sensors_online": sensors_online,
                "uptime": uptime,
                "timeseries": [] # We don't push heavy timeseries in the high-freq stream
            }
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(2)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# --- Community Tickets System ---
community_tickets_db = [
    {
        "id": "ct-101",
        "issue": "Camera Feed Loss at Pole 12",
        "solution": "Replaced the 5V power adapter module and cleared spider webs blocking the lens.",
        "rating": 12,
        "comments": [{"author": "john@smartway.com", "text": "This solved my issue instantly. Thanks!", "timestamp": "1 hr ago"}],
        "time": "2 hrs ago"
    },
    {
        "id": "ct-102",
        "issue": "RFID Delay at Gate B",
        "solution": "Firmware was downgraded to v2.1 due to known memory leak latency in the new patch.",
        "rating": 8,
        "comments": [],
        "time": "5 hrs ago"
    }
]

@app.get("/api/community-tickets")
async def get_community_tickets():
    return {"status": "success", "data": community_tickets_db}

@app.post("/api/community-tickets/new")
async def create_community_ticket(payload: dict):
    new_ticket = {
        "id": f"ct-{100 + len(community_tickets_db) + 1}",
        "issue": payload.get("issue", "Unknown Issue"),
        "solution": payload.get("solution", "Pending Analysis"),
        "rating": 0,
        "comments": [],
        "time": "Just now"
    }
    community_tickets_db.insert(0, new_ticket) # Add to top
    return {"status": "success", "data": new_ticket}

@app.post("/api/community-tickets/{ticket_id}/rate")
async def rate_community_ticket(ticket_id: str, action: dict):
    # action contains {"type": "up" | "down"}
    for t in community_tickets_db:
        if t["id"] == ticket_id:
            if action.get("type") == "up":
                t["rating"] += 1
            else:
                t["rating"] -= 1
            return {"status": "success", "data": t}
    raise HTTPException(status_code=404, detail="Ticket not found")

@app.post("/api/community-tickets/{ticket_id}/comment")
async def comment_community_ticket(ticket_id: str, payload: dict):
    # payload contains {"author": "...", "text": "..."}
    for t in community_tickets_db:
        if t["id"] == ticket_id:
            new_comment = {
                "author": payload.get("author", "User"),
                "text": payload.get("text", ""),
                "timestamp": "Just now"
            }
            t["comments"].append(new_comment)
            return {"status": "success", "data": t}
    raise HTTPException(status_code=404, detail="Ticket not found")
