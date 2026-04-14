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

import time

def add_knowledge(text: str, metadata: dict = None):
    """Inject a new document into the ChromaDB Knowledge Base dynamically."""
    doc_id = f"custom_doc_{int(time.time() * 1000)}"
    collection.add(
        documents=[text],
        metadatas=[metadata or {}],
        ids=[doc_id]
    )

def query_rag_pipeline_stream(user_query: str, history: list = None, language: str = "en", image_base64: str = None):
    """
    RAG Pipeline implementation with Memory and Streaming:
    1. Query ChromaDB for context.
    2. Construct prompt pushing previous chat history.
    3. Yield tokens directly back to the FastAPI chunk buffer.
    """
    history = history or []
    
    # 1. Retrieve context
    results = collection.query(
        query_texts=[user_query],
        n_results=3
    )
    
    retrieved_excerpts = results['documents'][0] if results['documents'] else []
    context = "\n".join([f"- {excerpt}" for excerpt in retrieved_excerpts])

    # 2. Build explicit system message with context
    system_prompt = (
        f"You are the Smart Highway IT RAG Agent. Help technicians troubleshoot hardware problems. "
        f"You have the following manual excerpts for context:\n{context}\n\n"
        f"Use this context to answer the user's latest query accurately. Be concise.\n\n"
        f"CRITICAL INSTRUCTION: You must reply exclusively and natively in language code: {language}. "
        f"Translate your entire response into {language}."
    )
    
    messages = [
        {
            "role": "system", 
            "content": system_prompt
        }
    ]
    
    # Handle Multimodal Groq Request Format
    model_name = "llama-3.1-8b-instant"
    user_message_content = [{"type": "text", "text": user_query}]
    
    if image_base64:
        # Switch to vision model
        model_name = "llama-3.2-11b-vision-preview"
        base64_data = image_base64.split(",")[1] if "," in image_base64 else image_base64
        # Add image dict inside content array
        user_message_content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_data}"
            }
        })
        
    for msg in history:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        
    messages.append({"role": "user", "content": user_message_content})

    # 3. Stream response using Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    try:
        if GROQ_API_KEY:
            groq_client = Groq(api_key=GROQ_API_KEY)
            stream = groq_client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.4,
                max_tokens=600,
                stream=True
            )
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
        else:
            # Mock streaming response
            mock_resp = f"[Mock Response - No GROQ_API_KEY found]\n\nBased on your query regarding \"{user_query}\", here is a simulated diagnostic:\n\nRelevant Context:\n{context}\n\n1. Ensure power supply is stable.\n2. Attempt a soft reset of the device.\n3. Check cables and physical connections.\n\nConfigure a real GROQ_API_KEY to see dynamic AI answers."
            # Yield word by word
            for word in mock_resp.split(" "):
                yield word + " "
                time.sleep(0.05)
                
    except Exception as e:
        yield f"\n\n[Error processing request: {str(e)}]"
