import os
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# --- LOAD ENV VARIABLES ---
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

# --- VALIDATION ---
if not API_KEY:
    raise ValueError("Missing GOOGLE_API_KEY. Set it in .env file.")

# --- STEP 1: LOAD DOCS ---
print("1. Loading PDFs from the 'docs' folder...")
loader = PyPDFDirectoryLoader("./docs")
docs = loader.load()
print(f"   Loaded {len(docs)} pages.")

# --- STEP 2: SPLIT ---
print("2. Splitting manuals into searchable chunks...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(docs)
print(f"   Created {len(chunks)} chunks.")

# --- STEP 3: VECTOR DB (REUSE IF EXISTS) ---
print("3. Building / Loading Vector Database...")

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

if os.path.exists("./chroma_db"):
    print("   Loading existing DB...")
    vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
else:
    print("   Creating new DB...")
    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="./chroma_db"
    )

# --- STEP 4: LLM ---
print("4. Connecting to Gemini...")

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",   # safer than 2.5
    temperature=0,
    google_api_key=API_KEY
)

# --- STEP 5: CHAIN ---
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

qa_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# --- SAFE INVOKE (RETRY HANDLING) ---
def safe_invoke(chain, query):
    try:
        return chain.invoke(query)
    except Exception as e:
        print("\n[WARNING] LLM failed:", str(e))
        return "LLM failed. Check API key / quota."

# --- TEST ---
print("\n--- SYSTEM READY ---")

test_ticket = "The Cisco IE 4000 port is flashing amber and the PoE link is down."

print(f"\nIncoming Ticket: {test_ticket}")
print("Thinking...")

response = safe_invoke(qa_chain, test_ticket)

print("\nAI Resolution:")
print(response)