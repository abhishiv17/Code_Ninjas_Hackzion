import os
import google.generativeai as genai

# Try to get the Gemini API key from the environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Configure Gemini API if a key is provided
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def analyze_ticket_with_ai(ticket_text: str) -> dict:
    """
    Analyzes a ticket using Gemini if the API key is set,
    otherwise falls back to a friendly mock response.
    """
    
    # 1. Fallback to mock data if no API key is set (perfect for local testing/hackathons)
    if not GEMINI_API_KEY:
        # Simple keyword matching for a better mock experience
        text_lower = ticket_text.lower()
        
        if "sensor" in text_lower or "thermal" in text_lower or "overheating" in text_lower:
            return {
                "type": "Hardware",
                "solution": "Replace 15A fuse in Panel B and physically inspect the sensor.",
                "confidence": 0.94
            }
        elif "network" in text_lower or "latency" in text_lower or "offline" in text_lower:
            return {
                "type": "Network",
                "solution": "Restart Sector 4 edge router and verify fiber connections.",
                "confidence": 0.88
            }
        else:
            return {
                "type": "Software",
                "solution": "Initiate over-the-air firmware reversion to stable version 2.4.",
                "confidence": 0.81
            }

    # 2. Use Gemini API if configured
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        You are an AI assistant for a Smart Highway monitoring system.
        Analyze the following incident ticket: "{ticket_text}"
        
<<<<<<< HEAD
=======
        Analyze the ticket and reply in the SAME language as the input.
        
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22
        Respond ONLY with a valid JSON object in this exact format:
        {{
            "type": "Hardware/Software/Network",
            "solution": "A short, actionable step to fix it",
            "confidence": 0.95
        }}
        """
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Strip potential markdown formatting that APIs sometimes add (e.g. ```json)
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
            
        import json
        return json.loads(response_text)
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Return a safe fallback if the API fails
        return {
            "type": "Unknown",
            "solution": "Manual inspection required. AI analysis failed.",
            "confidence": 0.00
        }
