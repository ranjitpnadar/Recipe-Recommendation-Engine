import streamlit as st
from langchain.schema import Document
from langchain_chroma import Chroma
# --- Feature 2: Insert User Input into Vector DB ---
def insert_user_input_into_vector_db(vector_db: Chroma, user_input_text: str, metadata: dict = None):
    """
    Converts user input into a document, creates its embedding, and adds it to the vector database.

    Args:
        vector_db (Chroma): The Chroma vector database instance.
        user_input_text (str): The text input from the user.
        metadata (dict, optional): Optional metadata to associate with the document. Defaults to None.
    """
    if not vector_db:
        st.error("Vector database is not initialized. Cannot insert user input.")
        return

    if not user_input_text.strip():
        st.warning("User input is empty. Not inserting into DB.")
        return

    if metadata is None:
        metadata = {"source": "user_input", "timestamp": st.session_state.get('current_time', 'N/A')} # Example metadata

    # Create a Document object from user input
    doc = Document(page_content=user_input_text, metadata=metadata)

    try:
        vector_db.add_documents([doc])
        st.success(f"Successfully added user input to vector database: '{user_input_text[:50]}...'")
    except Exception as e:
        st.error(f"Error adding user input to vector database: {e}")
