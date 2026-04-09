import os
import time
from dotenv import load_dotenv

# ==============================
# ENV SETUP
# ==============================
load_dotenv()
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
os.environ["USER_AGENT"] = "SmartHighwayAgent/1.0" 

# Look for the Groq API Key instead of Google
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("\n[CRITICAL ERROR] GROQ_API_KEY missing. Please add it to your .env file.")
    exit(1)

# ==============================
# IMPORTS
# ==============================
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# NEW: Import the Groq chat model
from langchain_groq import ChatGroq

# ==============================
# STEP 1 & 2: LOAD & SPLIT DOCS
# ==============================
print("1. Loading and splitting PDFs from './docs'...")
chunks = []
try:
    loader = PyPDFDirectoryLoader("./docs")
    docs = loader.load()
    if docs:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(docs)
        print(f"   -> Success: Created {len(chunks)} searchable chunks.")
    else:
        print("   -> [WARNING] No PDFs found in docs folder.")
except Exception as e:
    print(f"   -> [ERROR] Failed to load/split PDFs: {e}")

# ==============================
# STEP 3: VECTOR DATABASE
# ==============================
print("2. Initializing Vector Database...")
vector_db = None
try:
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    if os.path.exists("./chroma_db"):
        vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
        print("   -> Success: Loaded existing DB.")
    elif chunks:
        vector_db = Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory="./chroma_db")
        print("   -> Success: Created new DB.")
except Exception as e:
    print(f"   -> [ERROR] Vector DB failed: {e}")

# ==============================
# STEP 4: LLM SETUP (GROQ)
# ==============================
print("3. Connecting to Groq AI...")

def initialize_llm():
    # Using incredibly fast open-source models hosted on Groq LPUs
    models_to_try = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "gemma2-9b-it"]
    for model_name in models_to_try:
        try:
            print(f"   -> Trying {model_name}...")
            # Clean Groq instantiation
            llm_instance = ChatGroq(
                temperature=0, 
                model_name=model_name,
                groq_api_key=GROQ_API_KEY
            )
            # Ping test to verify the connection
            llm_instance.invoke("ping")
            print(f"   -> [SUCCESS] Connected to {model_name}")
            return llm_instance
        except Exception as e:
            print(f"   -> [FAILED] {model_name} error: {e}")
            
    print("   -> [CRITICAL] All Groq models failed. Falling back to offline mode.")
    return None

llm = initialize_llm()

# ==============================
# STEP 5: RAG CHAIN
# ==============================
print("4. Assembling RAG Chain...")
qa_chain = None
retriever = vector_db.as_retriever(search_kwargs={"k": 3}) if vector_db else None

template = """You are a Smart Highway IT agent.
Use ONLY the provided manual excerpts to answer the ticket. 
If the exact answer isn't there, say "Based on standard procedures..." and give general advice.

Context:
{context}

Ticket:
{question}
"""
prompt = ChatPromptTemplate.from_template(template)

def format_docs(docs):
    return "\n\n".join([d.page_content for d in docs])

if llm and retriever:
    try:
        qa_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        print("   -> [SUCCESS] System is armed and ready.")
    except Exception as e:
        print(f"   -> [ERROR] Chain assembly failed: {e}")

# ==============================
# FALLBACK & INVOCATION
# ==============================
def fallback_response(query):
    print("\n[USING OFFLINE FALLBACK MODE]")
    try:
        if not retriever:
            return "No database available. Check physical connections and power cycle."
        
        rel_docs = retriever.invoke(query)
        if not rel_docs:
            return "No relevant manuals found."
            
        context = "\n\n".join([d.page_content for d in rel_docs])
        return f"Raw Manual Data:\n-----------------\n{context[:800]}...\n-----------------\nCheck switch port configurations and cable integrity."
    except Exception as e:
        return f"System failure: {e}"

def safe_invoke(chain, query):
    if chain is None:
        return fallback_response(query)
    try:
        return chain.invoke(query)
    except Exception as e:
        print(f"\n[API ERROR]: {e}")
        return fallback_response(query)

# ==============================
# EXPORT FOR FRONTEND
# ==============================
# We just define a helper function so the frontend can call it easily
def process_ticket(ticket_text):
    if qa_chain is None:
        return fallback_response(ticket_text)
    return safe_invoke(qa_chain, ticket_text)