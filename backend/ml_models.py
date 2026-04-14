import os, joblib, numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd

MODEL_PATH, VEC_PATH = "root_model.pkl", "vectorizer.pkl"
DISABLE_ML = os.getenv("DISABLE_ML", "false").lower() == "true"

def train_root_cause_model():
    df = pd.DataFrame([
        ("node offline voltage drop", "fuse_failure"),
        ("sensor timeout api error", "software_timeout"),
        ("no power panel dead", "power_failure"),
        ("intermittent signal loss", "relay_fault"),
    ], columns=["text", "label"])
    vec = TfidfVectorizer()
    X = vec.fit_transform(df["text"])
    model = RandomForestClassifier(n_estimators=10, random_state=42)
    model.fit(X, df["label"])
    joblib.dump(model, MODEL_PATH)
    joblib.dump(vec, VEC_PATH)
    return model, vec

if not DISABLE_ML:
    if os.path.exists(MODEL_PATH):
        rc_model = joblib.load(MODEL_PATH)
        rc_vectorizer = joblib.load(VEC_PATH)
    else:
        rc_model, rc_vectorizer = train_root_cause_model()

    anomaly_model = IsolationForest(contamination=0.1, random_state=42)
    anomaly_model.fit(np.array([[40, 220], [42, 221], [39, 219], [41, 222]]))

    # Live Monitoring Urgency Model
    from sklearn.linear_model import LogisticRegression

    # Features: [ticket_frequency_12h, hardware_status (0: offline, 1: online), latency_ms]
    # Given the small demo, we train an inline LogisticRegression to produce probabilities.
    urgency_model = LogisticRegression(random_state=42)
    # Dummy data: [tickets, status, latency] 
    X_urgency = np.array([
        [0, 1, 10],   # No tickets, online, low latency  (Normal) -> 0
        [5, 1, 200],  # Some tickets, online, med latency (Moderate) -> 1
        [15, 0, 800], # Many tickets, offline, high latency (Critical) -> 1
        [2, 0, 50],   # Few tickets, offline (Action needed) -> 1
        [1, 1, 15]    # One ticket, online -> 0
    ])
    y_urgency = np.array([0, 0, 1, 1, 0])
    urgency_model.fit(X_urgency, y_urgency)
else:
    rc_model = None
    rc_vectorizer = None
    anomaly_model = None
    urgency_model = None

def predict_root_cause(text):
    if DISABLE_ML:
        return "software_timeout", 0.85
    probs = rc_model.predict_proba(rc_vectorizer.transform([text]))[0]
    best_idx = np.argmax(probs)
    return rc_model.classes_[best_idx], probs[best_idx]

def detect_anomaly(temp, voltage):
    if DISABLE_ML:
        return "anomaly" if temp > 45 or voltage > 230 else "normal"
    return "anomaly" if anomaly_model.predict([[temp, voltage]])[0] == -1 else "normal"

def predict_urgency(ticket_frequency: int, hardware_status_code: int, latency: float) -> float:
    """
    Returns a probability percentage (0-100) indicating how sure the AI is
    that the current situation requires immediate manual support.
    """
    if DISABLE_ML:
        if hardware_status_code == 0:
            return 95.0
        return 75.0 if ticket_frequency > 5 else 10.0
    features = np.array([[ticket_frequency, hardware_status_code, latency]])
    prob = urgency_model.predict_proba(features)[0][1] # Probability of Class '1' (Urgent)
    return float(round(prob * 100, 2))
