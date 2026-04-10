from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

# Initialize the FastAPI app
app = FastAPI(title="Smart Highway RAG Backend")

# 1. CORS CONFIGURATION (Crucial for connecting to Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. DATA MODELS
class TicketQuery(BaseModel):
    query: str

class TicketResponse(BaseModel):
    status: str
    response: str
    error: str | None = None

# 3. MOCK RAG KNOWLEDGE BASE
def retrieve_rag_answer(query: str) -> str:
    query_lower = query.lower()
    
    if "network switch offline" in query_lower:
        return (
            "🛠️ **Network Switch Offline (Section B, Gate 4)**\n\n"
            "**Diagnosis:** Power fluctuation detected on the secondary grid.\n"
            "**Steps to Resolve:**\n"
            "1. Attempt remote restart via Command Center.\n"
            "2. If unreachable, dispatch field technician to reset breaker B-402.\n"
            "3. Verify firmware version is >= v2.4.1 upon reboot."
        )
    elif "camera feed loss" in query_lower:
        return (
            "📹 **Camera Feed Loss (Pole 12)**\n\n"
            "**Diagnosis:** Fiber optic signal degradation.\n"
            "**Steps to Resolve:**\n"
            "1. Reroute monitoring to adjacent cameras (Pole 11 and 13).\n"
            "2. Run automated optical time-domain reflectometer (OTDR) test.\n"
            "3. Check for physical cable damage at junction box 12-A."
        )
    elif "rfid" in query_lower:
        return (
            "📡 **RFID Reader Failure (Toll 1)**\n\n"
            "**Diagnosis:** Antenna calibration error.\n"
            "**Steps to Resolve:**\n"
            "1. Switch Toll 1 lane to manual ticketing immediately.\n"
            "2. Recalibrate reader frequency to 865-868 MHz.\n"
            "3. Clean the transceiver plate if weather conditions are poor."
        )
    else:
        return (
            "I am searching the IT manuals for: '" + query + "'.\n"
            "No direct hardware failure detected in the standard logs. Please provide more specific error codes or location data."
        )

# 4. API ENDPOINT
@app.post("/api/solve-ticket", response_model=TicketResponse)
async def solve_ticket(request: TicketQuery):
    try:
        # Simulate AI processing time (1.5 seconds)
        await asyncio.sleep(1.5)
        
        # Get the answer from our "RAG" engine
        answer = retrieve_rag_answer(request.query)
        
        return TicketResponse(
            status="success",
            response=answer
        )
    except Exception as e:
        return TicketResponse(
            status="error",
            response="",
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)