os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
import os
import time
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# ==============================
# ENV SETUP
# ==============================
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
os.environ["HF_TOKEN"] = os.getenv("HF_TOKEN")

if not API_KEY:
    raise ValueError("ERROR: GOOGLE_API_KEY missing. Add it in .env file.")

# Optional stability tweak
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"

# ==============================
# STEP 1: LOAD DOCUMENTS
# ==============================
print("1. Loading PDFs from the 'docs' folder...")

try:
    loader = PyPDFDirectoryLoader("./docs")
    docs = loader.load()
    if not docs:
        raise ValueError("No PDFs found in docs folder.")
    print(f"   Loaded {len(docs)} pages.")
except Exception as e:
    raise RuntimeError(f"Failed to load PDFs: {e}")

# ==============================
# STEP 2: SPLIT DOCUMENTS
# ==============================
print("2. Splitting manuals into searchable chunks...")

try:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(docs)
    if not chunks:
        raise ValueError("Chunking failed.")
    print(f"   Created {len(chunks)} chunks.")
except Exception as e:
    raise RuntimeError(f"Text splitting failed: {e}")

# ==============================
# STEP 3: VECTOR DATABASE
# ==============================
print("3. Building / Loading Vector Database...")

try:
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    if os.path.exists("./chroma_db"):
        print("   Loading existing DB...")
        vector_db = Chroma(
            persist_directory="./chroma_db",
            embedding_function=embeddings
        )
    else:
        print("   Creating new DB...")
        vector_db = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory="./chroma_db"
        )

except Exception as e:
    raise RuntimeError(f"Vector DB error: {e}")

# ==============================
# STEP 4: LLM INITIALIZATION
# ==============================
print("4. Connecting to Gemini...")

def initialize_llm():
    models_to_try = [
        "gemini-1.0-pro",
        "gemini-pro",
        "models/gemini-pro"
    ]

    for model_name in models_to_try:
        try:
            print(f"   Trying model: {model_name}")
            llm_instance = ChatGoogleGenerativeAI(
                model=model_name,
                temperature=0,
                google_api_key=API_KEY
            )
            print(f"   SUCCESS: Connected using {model_name}")
            return llm_instance
        except Exception as e:
            print(f"   FAILED: {model_name} -> {e}")

    print("   All Gemini models failed. Switching to fallback mode.")
    return None

llm = initialize_llm()

# ==============================
# STEP 5: BUILD RAG CHAIN
# ==============================
print("5. Creating the RAG Chain...")

retriever = vector_db.as_retriever(search_kwargs={"k": 3})

template = """You are a Smart Highway IT agent.
Based ONLY on the provided manuals, explain the issue and give exact steps to fix it.

Context:
{context}

Ticket:
{question}
"""

prompt = ChatPromptTemplate.from_template(template)

def format_docs(docs):
    return "\n\n".join([d.page_content for d in docs])

if llm:
    try:
        qa_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
    except Exception as e:
        print(f"Chain creation failed: {e}")
        qa_chain = None
else:
    qa_chain = None

# ==============================
# FALLBACK SYSTEM (NO LLM)
# ==============================
def fallback_response(query):
    print("[FALLBACK MODE ACTIVATED]")

    try:
        docs = retriever.get_relevant_documents(query)

        if not docs:
            return "No relevant information found in manuals."

        context = "\n\n".join([d.page_content for d in docs])

        return f"""
[FALLBACK MODE – LLM UNAVAILABLE]

Relevant manual excerpts:
{context}

Suggested troubleshooting steps:
1. Check PoE power supply to the device
2. Verify Ethernet cable and connection
3. Check switch port status (admin down / errors)
4. Restart the port or switch
5. Inspect LED indicators (amber = fault)
6. Replace faulty cable or hardware if needed
"""

    except Exception as e:
        return f"Fallback failed: {e}"

# ==============================
# SAFE INVOCATION (RETRY + FALLBACK)
# ==============================
def safe_invoke(chain, query):
    if chain is None:
        return fallback_response(query)

    retries = 3
    delay = 3

    for attempt in range(retries):
        try:
            return chain.invoke(query)

        except Exception as e:
            print(f"[WARNING] Attempt {attempt+1} failed: {e}")

            if "429" in str(e):
                print("Rate limit hit. Waiting...")
                time.sleep(10)

            elif "403" in str(e):
                print("API key issue. Switching to fallback.")
                return fallback_response(query)

            elif "404" in str(e):
                print("Model not found. Switching to fallback.")
                return fallback_response(query)

            time.sleep(delay)

    print("All retries failed. Using fallback.")
    return fallback_response(query)

# ==============================
# TEST RUN
# ==============================
print("\n--- SYSTEM READY ---")

test_ticket = "The Cisco IE 4000 port is flashing amber and the PoE link is down."

print(f"\nIncoming Ticket: {test_ticket}")
print("Thinking...")

response = safe_invoke(qa_chain, test_ticket)

print("\nAI Resolution:")
print(response)