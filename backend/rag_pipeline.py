import os
import time
import re
from dotenv import load_dotenv
import chromadb
from groq import Groq

load_dotenv()

# Initialize ChromaDB client (in-memory for demo purposes)
chroma_client = chromadb.Client()

# Create or get collection
collection = chroma_client.get_or_create_collection(name="hardware_manuals")

# In-memory BM25 corpus synced with ChromaDB documents
_bm25_corpus: list[str] = []
_bm25_ids: list[str] = []

def _tokenize(text: str) -> list[str]:
    """Simple whitespace + lowercase tokenizer for BM25."""
    return re.findall(r'\w+', text.lower())

def _build_bm25(corpus: list[list[str]]):
    """Build a BM25 index from a list of tokenized documents."""
    try:
        from rank_bm25 import BM25Okapi
        return BM25Okapi(corpus)
    except ImportError:
        return None

# Seed mock documents if empty
if collection.count() == 0:
    mock_documents = [
        "Network Switch Manual: To reset the switch, hold the small push button located on the front panel for 10 seconds. Check indicator lights. Solid green means connected.",
        "Network Switch Manual: If latency exceeds 500ms, the switch might be dropping packets due to bad buffer configurations. Restart the network interfaces.",
        "RFID Reader Manual: A failure to read tags often indicates a disconnected antenna or power failure at the main junction. Check connections.",
        "RFID Reader Manual: If the RFID reader shows error code E-404, it means the reader cannot communicate with the central database.",
        "Camera Manual: Blurry images indicate lens contamination, while no feed usually points to a dead PoE injector or cut ethernet cable.",
        "Camera Manual: If the camera feed is distorted with horizontal lines, check the grounding of the power supply.",
        "EPAC600-ATC Manual: The EPAC600 controller uses a CAN bus protocol. Error code 0x02 indicates bus-off state, requiring a node restart.",
        "Boom Barrier Manual: If the barrier fails to open after successful RFID scan, check the motor relay on terminal block TB3.",
        "Cisco IE-4000 Manual: To configure VLAN trunking, use the interface command: switchport mode trunk; switchport trunk allowed vlan all.",
        "FLIR Camera Manual: Night vision mode activates automatically below 0.1 lux. Manual override available via ONVIF command set.",
    ]
    ids = [f"doc_{i}" for i in range(len(mock_documents))]
    collection.add(documents=mock_documents, ids=ids)
    _bm25_corpus.extend(mock_documents)
    _bm25_ids.extend(ids)
else:
    # Sync existing corpus into BM25 memory store
    existing = collection.get()
    _bm25_corpus.extend(existing.get("documents", []))
    _bm25_ids.extend(existing.get("ids", []))


def add_knowledge(text: str, metadata: dict = None):
    """Inject a new document into the ChromaDB Knowledge Base dynamically and update BM25 corpus."""
    doc_id = f"custom_doc_{int(time.time() * 1000)}"
    collection.add(
        documents=[text],
        metadatas=[metadata or {}],
        ids=[doc_id]
    )
    # Also add to the in-memory BM25 corpus
    _bm25_corpus.append(text)
    _bm25_ids.append(doc_id)


def hybrid_retrieve(user_query: str, n_results: int = 4) -> list[str]:
    """
    Hybrid Retrieval: Fuses ChromaDB semantic vector search with BM25 keyword matching.
    Returns the top-N deduplicated results ranked by a combined score.
    """
    # --- 1. Semantic Search (ChromaDB) ---
    vector_results = collection.query(query_texts=[user_query], n_results=min(n_results, collection.count()))
    vector_docs = vector_results.get("documents", [[]])[0]
    vector_ids = vector_results.get("ids", [[]])[0]

    # --- 2. Keyword Search (BM25) ---
    bm25_docs = []
    if _bm25_corpus:
        tokenized_corpus = [_tokenize(doc) for doc in _bm25_corpus]
        bm25_index = _build_bm25(tokenized_corpus)
        if bm25_index:
            tokenized_query = _tokenize(user_query)
            scores = bm25_index.get_scores(tokenized_query)
            # Get top-N indices sorted by score (descending)
            top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:n_results]
            bm25_docs = [_bm25_corpus[i] for i in top_indices if scores[i] > 0]

    # --- 3. Fuse Results (Deduplicate, semantic first) ---
    seen = set()
    fused = []
    for doc in vector_docs + bm25_docs:
        if doc not in seen:
            seen.add(doc)
            fused.append(doc)
        if len(fused) >= n_results:
            break

    return fused


def query_rag_pipeline_stream(user_query: str, history: list = None, language: str = "en", image_base64: str = None):
    """
    RAG Pipeline with Hybrid BM25 + ChromaDB Retrieval, Memory, and Streaming.
    1. Hybrid-retrieve relevant context (semantic + keyword).
    2. Construct prompt with chat history.
    3. Yield tokens directly back to the FastAPI chunk buffer.
    """
    history = history or []
    
    # 1. Hybrid-retrieve context (BM25 + ChromaDB fusion)
    retrieved_excerpts = hybrid_retrieve(user_query, n_results=4)
    context = "\n".join([f"- {excerpt}" for excerpt in retrieved_excerpts])

    # 2. Build system message with context
    system_prompt = (
        f"You are the Smart Highway IT RAG Agent. Help technicians troubleshoot hardware problems. "
        f"You have the following manual excerpts for context:\n{context}\n\n"
        f"Use this context to answer the user's latest query accurately. Be concise.\n\n"
        f"CRITICAL INSTRUCTION: You must reply exclusively and natively in language code: {language}. "
        f"Translate your entire response into {language}."
    )
    
    messages = [{"role": "system", "content": system_prompt}]
    
    # Handle Multimodal Groq Request Format
    model_name = "llama-3.1-8b-instant"
    user_message_content = [{"type": "text", "text": user_query}]
    
    if image_base64:
        # Switch to vision model
        model_name = "llama-3.2-11b-vision-preview"
        base64_data = image_base64.split(",")[1] if "," in image_base64 else image_base64
        user_message_content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{base64_data}"}
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
            for word in mock_resp.split(" "):
                yield word + " "
                time.sleep(0.05)
                
    except Exception as e:
        yield f"\n\n[Error processing request: {str(e)}]"
