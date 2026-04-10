import os, joblib, numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd

MODEL_PATH, VEC_PATH = "root_model.pkl", "vectorizer.pkl"

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

if os.path.exists(MODEL_PATH):
    rc_model = joblib.load(MODEL_PATH)
    rc_vectorizer = joblib.load(VEC_PATH)
else:
    rc_model, rc_vectorizer = train_root_cause_model()

def predict_root_cause(text):
    probs = rc_model.predict_proba(rc_vectorizer.transform([text]))[0]
    best_idx = np.argmax(probs)
    return rc_model.classes_[best_idx], probs[best_idx]

anomaly_model = IsolationForest(contamination=0.1, random_state=42)
anomaly_model.fit(np.array([[40, 220], [42, 221], [39, 219], [41, 222]]))

def detect_anomaly(temp, voltage):
    return "anomaly" if anomaly_model.predict([[temp, voltage]])[0] == -1 else "normal"
