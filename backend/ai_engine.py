import os, json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

FALLBACK = {
    "sensor|thermal|overheating": ("Hardware", "Replace 15A fuse in Panel B and physically inspect the sensor.", 0.94),
    "network|latency|offline": ("Network", "Restart Sector 4 edge router and verify fiber connections.", 0.88),
}

def analyze_ticket_with_ai(ticket_text: str, image_base64: str = None) -> dict:
    if not groq_client:
        text_lower = ticket_text.lower()
        for keywords, (issue_type, solution, conf) in FALLBACK.items():
            if any(kw in text_lower for kw in keywords.split("|")):
                return {"type": issue_type, "solution": solution, "confidence": conf}
        return {"type": "Software", "solution": "Initiate over-the-air firmware reversion to stable version 2.4.", "confidence": 0.81}
    try:
        model = "llama-3.1-8b-instant"
        messages = [
            {"role": "system", "content": "Return: {\"type\": \"Hardware/Software/Network\", \"solution\": \"action\", \"confidence\": 0.0-1.0}"},
            {"role": "user", "content": f'Ticket: "{ticket_text}"'}
        ]

        if image_base64:
            model = "llama-3.2-11b-vision-preview"
            messages = [
                {"role": "system", "content": "Return: {\"type\": \"Hardware/Software/Network\", \"solution\": \"action\", \"confidence\": 0.0-1.0}"},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f'Ticket: "{ticket_text}"'},
                        {"type": "image_url", "image_url": {"url": image_base64}}
                    ]
                }
            ]

        msg = groq_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=256
        )
        text = msg.choices[0].message.content.strip()
        for p in ("```json", "```"):
            if text.startswith(p):
                text = text[len(p):-3]
                break
        return json.loads(text)
    except Exception as e:
        # Enhanced fallback on error
        text_lower = ticket_text.lower()
        for keywords, (issue_type, solution, conf) in FALLBACK.items():
            if any(kw in text_lower for kw in keywords.split("|")):
                return {"type": issue_type, "solution": solution, "confidence": conf}
        return {
            "type": "Software", 
            "solution": f"Processing ticket: {ticket_text[:100]}... Recommend diagnostic scan and manual review by admin team.", 
            "confidence": 0.65
        }

def triage_with_ai(title: str, description: str, image_base64: str = None) -> dict:
    fallback = {"severity": "medium", "tags": ["Untriaged"], "assignedTo": "General Support"}
    if not groq_client: return fallback
    try:
        model = "llama-3.1-8b-instant"
        prompt = f"Categorize severity strictly as low, medium, high, or critical. Provide 2-3 short tags. Return JSON format exactly like: {{\"severity\": \"high\", \"tags\": [\"Network\", \"Latency\"], \"assignedTo\": \"Network Engineers\"}}.\n\nTicket Title: {title}\nDescription: {description}"
        messages = [{"role": "user", "content": prompt}]
        
        if image_base64:
            model = "llama-3.2-11b-vision-preview"
            messages = [{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": image_base64}}]}]

        msg = groq_client.chat.completions.create(
            model=model,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=150
        )
        return json.loads(msg.choices[0].message.content)
    except Exception:
        return fallback
