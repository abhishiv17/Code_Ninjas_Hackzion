from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from brains import process_ticket
import uvicorn

app = FastAPI(title="Smart Highway RAG Backend")

# 1. CORS CONFIGURATION (Crucial for connecting to your Next.js app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. DATA MODELS (Matches your React TicketResponse interface)
class TicketRequest(BaseModel):
    query: str

class TicketResponse(BaseModel):
    status: str
    response: str
    error: str | None = None

# 3. ENDPOINT
@app.post("/api/solve-ticket", response_model=TicketResponse)
async def solve_ticket(request: TicketRequest):
    try:
        # Pass the query directly to your LangChain logic
        answer = process_ticket(request.query)
        
        return TicketResponse(
            status="success", 
            response=answer
        )
    except Exception as e:
        # Graceful error handling for the frontend UI
        return TicketResponse(
            status="error", 
            response="", 
            error=str(e)
        )

# 4. SERVER STARTUP
if __name__ == "__main__":
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )