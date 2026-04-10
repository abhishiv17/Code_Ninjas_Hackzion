import json
import os

FEEDBACK_FILE = "feedback.json"

def save_feedback(ticket_query, solution_given, was_successful):
    entry = {
        "query": ticket_query,
        "solution": solution_given,
        "success": was_successful
    }
    
    # Simple file-based append
    data = []
    if os.path.exists(FEEDBACK_FILE):
        try:
            with open(FEEDBACK_FILE, "r") as f:
                data = json.load(f)
        except json.JSONDecodeError:
            pass
            
    data.append(entry)
    
    with open(FEEDBACK_FILE, "w") as f:
        json.dump(data, f, indent=2)
        
    return {"message": "Feedback recorded successfully"}
