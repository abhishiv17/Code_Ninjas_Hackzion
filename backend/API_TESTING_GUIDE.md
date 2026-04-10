"""
OMNISSOLVE AI API - TESTING GUIDE
==================================

This guide shows how to use all three endpoints of the OmniSolve AI backend.
The backend now uses Groq LLM (instead of Gemini) with ML models for predictions.

SETUP:
------
1. Create a .env file in the backend directory with:
   GROQ_API_KEY=your_groq_api_key_here

2. Install dependencies:
   pip install -r requirements.txt

3. Start the server:
   python -m uvicorn main:app --reload --port 8001

API ENDPOINTS:
==============

1. GET / - Health Check
   Returns: Server status message
   
   Example:
   curl http://127.0.0.1:8001/

2. POST /analyze - AI Ticket Analysis (Groq LLM)
   Purpose: Analyzes a ticket description using Groq's Mixtral LLM
   Fallback: Mock response if GROQ_API_KEY not set
   
   Input: {"ticket": "string describing the issue"}
   Output: {"type": "Hardware|Software|Network", "solution": "string", "confidence": 0.0-1.0}
   
   Examples:
   - Sensor issue: "sensor overheating in lane detection unit"
   - Network issue: "communication timeout with edge server"
   - Software issue: "firmware crash during data sync"
   
   PowerShell Example:
   $body = @{ticket="sensor overheating issue"} | ConvertTo-Json
   Invoke-WebRequest -Uri "http://127.0.0.1:8001/analyze" -Method POST `
     -ContentType "application/json" -Body $body | Select-Object -ExpandProperty Content

3. POST /predict-root-cause - ML Root Cause Prediction
   Purpose: Predicts root cause from description using trained RandomForest model
   No fallback: Always uses ML model (loaded at startup)
   
   Input: {"description": "string describing the symptom"}
   Output: {"root_cause": "fuse_failure|software_timeout|power_failure|relay_fault", "confidence": 0.0-1.0}
   
   Training data includes:
   - "node offline voltage drop" -> fuse_failure
   - "sensor timeout api error" -> software_timeout
   - "no power panel dead" -> power_failure
   - "intermittent signal loss" -> relay_fault
   
   PowerShell Example:
   $body = @{description="sensor timeout api error"} | ConvertTo-Json
   Invoke-WebRequest -Uri "http://127.0.0.1:8001/predict-root-cause" `
     -Method POST -ContentType "application/json" -Body $body | Select-Object -ExpandProperty Content

4. POST /detect-anomaly - ML Anomaly Detection
   Purpose: Detects anomalous temperature/voltage readings using Isolation Forest
   No fallback: Always uses ML model (loaded at startup)
   
   Input: {"temperature": float, "voltage": float}
   Output: {"status": "anomaly|normal"}
   
   Normal baseline data:
   - [40°C, 220V], [42°C, 221V], [39°C, 219V], [41°C, 222V]
   
   PowerShell Example:
   $body = @{temperature=35.5; voltage=215} | ConvertTo-Json
   Invoke-WebRequest -Uri "http://127.0.0.1:8001/detect-anomaly" `
     -Method POST -ContentType "application/json" -Body $body | Select-Object -ExpandProperty Content

PERFORMANCE:
============
✓ ML Models (Root Cause, Anomaly): Loaded ONCE at startup, reused for all requests (zero disk I/O)
✓ Groq LLM: API call per request (normal for LLM backends)
✓ Fallback System: Automatic mock responses if API key missing or service fails

ENVIRONMENT VARIABLES:
======================
GROQ_API_KEY - Your Groq API key (get from https://console.groq.com/keys)

The code automatically checks for this variable on startup.
If not set, the /analyze endpoint returns mock responses based on keyword matching.

ERROR HANDLING:
===============
- /analyze: Returns {"type": "Unknown", "solution": "Manual inspection required. AI analysis failed.", "confidence": 0.0}
- /predict-root-cause: Returns ML prediction based on trained model (always succeeds)
- /detect-anomaly: Returns anomaly detection result (always succeeds)

INTERACTIVE DOCS:
=================
After starting the server, visit:
http://127.0.0.1:8001/docs

This gives you an interactive UI to test all endpoints without needing curl/Postman.
"""
