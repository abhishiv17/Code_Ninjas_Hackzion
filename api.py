from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from brains import process_ticket

app = FastAPI()

# Allow your frontend to talk to this API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the data format we expect from the frontend
class TicketRequest(BaseModel):
    query: str

@app.post("/api/solve-ticket")
async def solve_ticket(request: TicketRequest):
    try:
        # Pass the query to your existing logic
        answer = process_ticket(request.query)
        return {"status": "success", "response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))