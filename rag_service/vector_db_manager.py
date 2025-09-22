# vector_db_manager.py
import os
import csv
from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings # For type hinting

# Removed st.info/st.success/st.error, replaced with print or logging for API context
# In a real-world API, you'd use a proper logging library (e.g., `logging`)

def create_vector_db_from_csv(csv_file_path: str, chroma_db_dir: str, embedding_model: OpenAIEmbeddings) -> Chroma:
    """
    Reads a CSV file, converts its content into documents, creates embeddings,
    and stores them in a Chroma vector database.
    """
    print(f"Creating vector database from {csv_file_path}...")
    documents = []
    try:
        with open(csv_file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                page_content = (
                    f"Recipe Name: {row.get('recipe_name', 'N/A')}\n"
                    f"Ingredients: {row.get('ingredients', 'N/A')}\n"
                )

                metadata = {
                    "id": f"recipe_{i}_{row.get('recipe_name', 'unknown').replace(' ', '_')}",
                    "recipe_name": row.get("recipe_name", "N/A"),
                    "cooking_time": row.get("total_time", "N/A"),
                    "ingredients": row.get("ingredients", "N/A"),
                    "nutrition": row.get("nutrition", "N/A"),
                    "image": row.get("img_src", "N/A")
                }
                doc = Document(page_content=page_content, metadata=metadata)
                documents.append(doc)
        print(f"Loaded {len(documents)} documents from CSV.")

    except FileNotFoundError:
        print(f"Error: CSV file not found at {csv_file_path}")
        return None
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return None

    if not documents:
        print("No documents were loaded from the CSV. Vector DB will not be created.")
        return None

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    print(f"Split documents into {len(chunks)} chunks.")

    vector_db = Chroma.from_documents(
        chunks,
        embedding_model,
        persist_directory=chroma_db_dir
    )
    print(f"Vector database created and persisted at {chroma_db_dir}")
    return vector_db

def insert_user_input_into_vector_db(vector_db: Chroma, user_input_text: str, metadata: dict = None):
    """
    Converts user input into a document, creates its embedding, and adds it to the vector database.
    """
    if not vector_db:
        print("Vector database is not initialized. Cannot insert user input.")
        return False # Indicate failure

    if not user_input_text.strip():
        print("User input is empty. Not inserting into DB.")
        return False

    if metadata is None:
        metadata = {"source": "user_input"}

    doc = Document(page_content=user_input_text, metadata=metadata)

    try:
        vector_db.add_documents([doc])
        print(f"Successfully added user input to vector database: '{user_input_text[:50]}...'")
        return True # Indicate success
    except Exception as e:
        print(f"Error adding user input to vector database: {e}")
        return False

def check_and_load_vector_db(chroma_db_dir: str, embedding_model: OpenAIEmbeddings, csv_file_path: str) -> Chroma:
    """
    Checks if the Chroma DB directory exists. If it does, loads the existing DB;
    otherwise, creates a new one from the CSV file.
    """
    if os.path.exists(chroma_db_dir) and os.listdir(chroma_db_dir):
        print(f"Loading existing vector database from {chroma_db_dir}...")
        try:
            vector_db = Chroma(
                persist_directory=chroma_db_dir,
                embedding_function=embedding_model
            )
            print("Vector database loaded successfully.")
            return vector_db
        except Exception as e:
            print(f"Error loading existing vector database: {e}. Attempting to recreate.")
            return create_vector_db_from_csv(csv_file_path, chroma_db_dir, embedding_model)
    else:
        print(f"Vector database not found at {chroma_db_dir}. Creating a new one...")
        return create_vector_db_from_csv(csv_file_path, chroma_db_dir, embedding_model)