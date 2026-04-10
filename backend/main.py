import sys, os
from datetime import datetime, timedelta
from typing import Optional, Dict

sys.path.insert(0, os.path.dirname(__file__))
from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from ai_engine import analyze_ticket_with_ai
from ml_models import predict_root_cause, detect_anomaly
from feedback import save_feedback

SECRET_KEY = os.getenv("SECRET_KEY", "dev-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS_DB: Dict[str, Dict] = {
    "demo@example.com": {
        "name": "Demo User",
        "email": "demo@example.com",
        "hashed_password": pwd_context.hash("Demo@1234"),
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
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

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
        result = analyze_ticket_with_ai(req.query)
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
