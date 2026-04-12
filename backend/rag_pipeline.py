import os
from dotenv import load_dotenv
import chromadb
from groq import Groq

load_dotenv()

# Initialize ChromaDB client (in-memory for demo purposes)
chroma_client = chromadb.Client()

# Create or get collection
collection = chroma_client.get_or_create_collection(name="hardware_manuals")

# Seed mock documents if empty
if collection.count() == 0:
    mock_documents = [
        "Network Switch Manual: To reset the switch, hold the small push button located on the front panel for 10 seconds. Check indicator lights. Solid green means connected.",
        "Network Switch Manual: If latency exceeds 500ms, the switch might be dropping packets due to bad buffer configurations. Restart the network interfaces.",
        "RFID Reader Manual: A failure to read tags often indicates a disconnected antenna or power failure at the main junction. Check connections.",
        "RFID Reader Manual: If the RFID reader shows error code E-404, it means the reader cannot communicate with the central database.",
        "Camera Manual: Blurry images indicate lens contamination, while no feed usually points to a dead PoE injector or cut ethernet cable.",
        "Camera Manual: If the camera feed is distorted with horizontal lines, check the grounding of the power supply."
    ]
    # We provide dummy IDs and let Chroma compute basic embeddings by default 
    # (Chroma uses an internal model for this by default when no embedding function is supplied)
    collection.add(
        documents=mock_documents,
        ids=[f"doc_{i}" for i in range(len(mock_documents))]
    )

# (We'll instanciate the Groq client locally in the function using GROQ_API_KEY)

def query_rag_pipeline(user_query: str) -> str:
    """
    RAG Pipeline implementation:
    1. Query ChromaDB for top 3 relevant manual excerpts.
    2. Construct prompt with context.
    3. Query Gemini for step-by-step troubleshooting.
    """
    # 1. Retrieve context
    results = collection.query(
        query_texts=[user_query],
        n_results=3
    )
    
    retrieved_excerpts = results['documents'][0] if results['documents'] else []
    context = "\n".join([f"- {excerpt}" for excerpt in retrieved_excerpts])

    # 2. Build prompt
    prompt = f"""
    You are the Smart Highway IT RAG Agent. You help technicians troubleshoot hardware problems.
    Given the following user query:
    "{user_query}"
    
    And the following relevant excerpts from our hardware manuals:
    {context}
    
    Please provide a concise, step-by-step troubleshooting guide to solve the issue. Use only the provided context if possible. If the context does not explicitly answer it, give generic IT advice related to the user's issue.
    """

    # 3. Generate response using Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    try:
        if GROQ_API_KEY:
            groq_client = Groq(api_key=GROQ_API_KEY)
            msg = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a helpful IT diagnostic assistant. Be concise."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=600
            )
            return msg.choices[0].message.content.strip()
        else:
            return f"""[Mock Response - No GROQ_API_KEY found]\n\nBased on your query regarding "{user_query}", here is a simulated diagnostic:\n\nRelevant Context Found:\n{context}\n\n1. Ensure power supply is stable.\n2. Attempt a soft reset of the device.\n3. Check cables and physical connections.\n\nEnsure you configure a real GROQ_API_KEY to see dynamic AI answers."""
            
    except Exception as e:
        return f"Error connecting to Groq API: {str(e)}"
