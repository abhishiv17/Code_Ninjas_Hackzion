from fastapi import FastAPI
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
    
    # Return the dictionary properly structured
    return result

# Simple root endpoint to verify the server is running
@app.get("/")
async def root():
    return {"message": "OmniSolve AI API is running! Use POST /analyze to analyze tickets."}
