import streamlit as st
import time
# Import your actual backend logic!
import brains 

# --- UI Configuration ---
st.set_page_config(
    page_title="Smart Highway AI Dashboard",
    page_icon="🛣️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom CSS for Terminal-like Output ---
st.markdown("""
<style>
    .terminal-output {
        background-color: #1e1e1e;
        color: #00ff00;
        padding: 20px;
        border-radius: 10px;
        font-family: 'Courier New', Courier, monospace;
        white-space: pre-wrap;
    }
</style>
""", unsafe_allow_html=True)


# --- Sidebar: Dashboard Controls ---
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ikea_logo.svg/1200px-Ikea_logo.svg.png", width=150) # Replace with your Hackathon Logo
    st.title("Admin Panel")
    st.markdown("---")
    
    # System Status Indicators
    st.subheader("System Status")
    if brains.qa_chain:
        st.success("🟢 AI Engine: ONLINE (Groq Llama-3.1)")
    else:
        st.error("🔴 AI Engine: OFFLINE (Fallback Mode)")
        
    if brains.vector_db:
        st.success("🟢 Vector DB: ONLINE (Chroma)")
    else:
        st.error("🔴 Vector DB: OFFLINE")
        
    st.markdown("---")
    st.caption("Code Ninjas Hackzion 2026")


# --- Main Application Area ---
st.title("🛣️ Smart Highway IT Support")
st.markdown("Submit hardware fault tickets below. The AI will cross-reference internal Cisco/networking manuals and provide resolution steps.")

# Create two columns for layout
col1, col2 = st.columns([1, 1.2])

with col1:
    st.subheader("📥 Submit New Ticket")
    
    # Pre-populated fake tickets for demo purposes
    demo_tickets = [
        "Select a demo ticket...",
        "The Cisco IE 4000 port is flashing amber and the PoE link is down.",
        "Camera 04 at Toll Plaza B is unresponsive, ping fails.",
        "Traffic sensor TS-99 reporting erratic data, suspect power loop."
    ]
    
    selected_demo = st.selectbox("Quick Demo Tickets:", demo_tickets)
    
    # Text area for custom input
    with st.form("ticket_form"):
        user_input = st.text_area(
            "Ticket Description:", 
            height=150, 
            placeholder="Describe the hardware issue, error codes, or LED status..."
        )
        
        # Logic to handle the select box vs text area
        if selected_demo != "Select a demo ticket..." and not user_input:
            user_input = selected_demo
            
        submitted = st.form_submit_button("🚀 Run AI Diagnostics", type="primary", use_container_width=True)

with col2:
    st.subheader("🧠 AI Diagnostics Output")
    
    if submitted:
        if not user_input or user_input == "Select a demo ticket...":
            st.warning("Please enter a ticket description.")
        else:
            with st.spinner("Analyzing manual vectors & querying Groq Llama 3.1..."):
                # Track processing time for cool factor
                start_time = time.time()
                
                # --- THIS CALLS YOUR BACKEND ---
                ai_response = brains.process_ticket(user_input)
                
                end_time = time.time()
                elapsed = round(end_time - start_time, 2)
            
            # Display Success Metrics
            st.success(f"Diagnostics complete in {elapsed} seconds.")
            
            # Display the output in a cool terminal style
            st.markdown('<div class="terminal-output">' + ai_response + '</div>', unsafe_allow_html=True)
            
    else:
        # Default state before submission
        st.info("System idling. Waiting for ticket input...")