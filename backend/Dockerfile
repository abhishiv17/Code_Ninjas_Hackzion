FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (build-essential for C extensions if needed by vector DBs)
RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run Uvicorn worker
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
