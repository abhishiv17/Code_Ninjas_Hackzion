import os
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
# NEW: The bulletproof local embeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# --- CONFIGURATION ---
os.environ["GOOGLE_API_KEY"] = "AIzaSyDY-h1EsiGR-1uEgvH8a_wDTHjKvTGhJZ4" 

print("1. Loading PDFs from the 'docs' folder...")
loader = PyPDFDirectoryLoader("./docs")
docs = loader.load()
print(f"   Loaded {len(docs)} pages.")

print("2. Splitting manuals into searchable chunks...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(docs)
print(f"   Created {len(chunks)} chunks.")

print("3. Building Vector Database (Using local HuggingFace embeddings to bypass Google bug)...")
# This runs locally and is 100% reliable
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_db = Chroma.from_documents(
    documents=chunks, 
    embedding=embeddings, 
    persist_directory="./chroma_db"
)

print("4. Connecting to Gemini 2.5 Flash for the Brain...")
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)
print("5. Creating the RAG Chain...")
retriever = vector_db.as_retriever(search_kwargs={"k": 3})

template = """You are a Smart Highway IT agent. Based ONLY on the provided manuals, explain what this error means and provide the exact steps to fix it.

Context from manuals:
{context}

Incoming Ticket:
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

# --- THE TEST ---
print("\n--- SYSTEM READY ---")
test_ticket = "The Cisco IE 4000 port is flashing amber and the PoE link is down."

print(f"\nIncoming Ticket: {test_ticket}")
print("Thinking...")

response = qa_chain.invoke(test_ticket)

print("\n🤖 AI Resolution:")
print(response)