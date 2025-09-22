import os
import csv
import streamlit as st
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.globals import set_llm_cache #inmemory cache
from langchain_core.caches import InMemoryCache
from langchain_community.cache import SQLiteCache
from langchain_community.document_loaders import CSVLoader
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.schema import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain_core.output_parsers import JsonOutputParser # Import JsonOutputParser
from pydantic import BaseModel, Field # Import BaseModel and Field for Pydantic
from langchain_core.runnables import RunnableLambda

# --- Configuration and Initialization ---
load_dotenv()
# set_llm_cache(InMemoryCache()) #init in memory cache
# set_llm_cache(SQLiteCache(database_path=".lc.db")) # Uncomment if you want SQLite caching

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    st.error("OPENAI_API_KEY not found in environment variables. Please set it.")
    st.stop()

embedding_model = OpenAIEmbeddings(api_key=OPENAI_API_KEY)
llm = ChatOpenAI(model="gpt-4o", api_key=OPENAI_API_KEY, temperature=0.7) # Added temperature for more creative responses
CHROMA_DB_DIR = "chroma_db"
CSV_FILE_PATH = "recipes.csv"

# --- Define Pydantic Model for JSON Output ---
class Recipe(BaseModel):
    recipe_name: str = Field(description="The name of the recipe.")
    estimated_total_time: str = Field(description="Estimated total time for preparation and cooking.")
    ingredients: list[str] = Field(description="A list of ingredients with quantities.")
    instructions: list[str] = Field(description="Step-by-step cooking instructions.")
    nutrition_information: str = Field(description="Nutritional breakdown (calories, carbs, protein, fat) or 'Not available'.")
    chef_tip: str = Field(description="An optional helpful tip related to the recipe.")

# --- Feature 1: Create Vector DB from CSV ---
def create_vector_db_from_csv(csv_file_path: str, chroma_db_dir: str, embedding_model: OpenAIEmbeddings) -> Chroma:
    """
    Reads a CSV file, converts its content into documents, creates embeddings,
    and stores them in a Chroma vector database.

    Args:
        csv_file_path (str): Path to the CSV file.
        chroma_db_dir (str): Directory to persist the Chroma DB.
        embedding_model (OpenAIEmbeddings): The embedding model to use.

    Returns:
        Chroma: The initialized Chroma vector database.
    """
    st.info(f"Creating vector database from {csv_file_path}...")
    documents = []
    try:
        with open(csv_file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                # Create a comprehensive page_content for better context
                page_content = (
                    f"Recipe Name: {row.get('recipe_name', 'N/A')}\n"
                    f"Total Time: {row.get('total_time', 'N/A')}\n"
                    f"Ingredients: {row.get('ingredients', 'N/A')}\n"
                    f"Instructions: {row.get('instructions', 'N/A')}\n" # Assuming you might add instructions later
                    f"Nutrition: {row.get('nutrition', 'N/A')}"
                )

                metadata = {
                    "id": f"recipe_{i}_{row.get('recipe_name', 'unknown').replace(' ', '_')}", # More robust ID
                    "recipe_name": row.get("recipe_name", "N/A"),
                    "cooking_time": row.get("total_time", "N/A"),
                    "ingredients": row.get("ingredients", "N/A"),
                    "nutrition": row.get("nutrition", "N/A"),
                    "image": row.get("img_src", "N/A")
                }
                doc = Document(page_content=page_content, metadata=metadata)
                documents.append(doc)
        st.success(f"Loaded {len(documents)} documents from CSV.")

    except FileNotFoundError:
        st.error(f"Error: CSV file not found at {csv_file_path}")
        return None
    except Exception as e:
        st.error(f"Error reading CSV file: {e}")
        return None

    if not documents:
        st.warning("No documents were loaded from the CSV. Vector DB will not be created.")
        return None

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    st.info(f"Split documents into {len(chunks)} chunks.")

    vector_db = Chroma.from_documents(
        chunks,
        embedding_model,
        persist_directory=chroma_db_dir
    )
    st.success(f"Vector database created and persisted at {chroma_db_dir}")
    return vector_db

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

# --- Feature 3: Check and Load Vector DB ---
def check_and_load_vector_db(chroma_db_dir: str, embedding_model: OpenAIEmbeddings, csv_file_path: str) -> Chroma:
    """
    Checks if the Chroma DB directory exists. If it does, loads the existing DB;
    otherwise, creates a new one from the CSV file.

    Args:
        chroma_db_dir (str): Directory where the Chroma DB is persisted.
        embedding_model (OpenAIEmbeddings): The embedding model to use.
        csv_file_path (str): Path to the CSV file (used if DB needs to be created).

    Returns:
        Chroma: The initialized Chroma vector database.
    """
    if os.path.exists(chroma_db_dir) and os.listdir(chroma_db_dir):
        st.info(f"Loading existing vector database from {chroma_db_dir}...")
        try:
            vector_db = Chroma(
                persist_directory=chroma_db_dir,
                embedding_function=embedding_model
            )
            st.success("Vector database loaded successfully.")
            return vector_db
        except Exception as e:
            st.error(f"Error loading existing vector database: {e}. Attempting to recreate.")
            # If loading fails, try to recreate
            return create_vector_db_from_csv(csv_file_path, chroma_db_dir, embedding_model)
    else:
        st.warning(f"Vector database not found at {chroma_db_dir}. Creating a new one...")
        return create_vector_db_from_csv(csv_file_path, chroma_db_dir, embedding_model)

# --- Streamlit Application ---
st.set_page_config(page_title="Recipe Recommender", page_icon="🍳")
st.title("🍳 AI-Powered Recipe Recommender")

# Initialize session state for vector_db if not already present
if 'vector_db' not in st.session_state:
    st.session_state.vector_db = None

# Load or create the vector database only once
if st.session_state.vector_db is None:
    st.session_state.vector_db = check_and_load_vector_db(CHROMA_DB_DIR, embedding_model, CSV_FILE_PATH)

if st.session_state.vector_db:
    retriever = st.session_state.vector_db.as_retriever(search_kwargs={"k": 5}) # Retrieve top 5 relevant documents

    # Initialize the JSON output parser
    parser = JsonOutputParser(pydantic_object=Recipe)

    system_prompt = """
    You are an expert chef and a helpful assistant. Your task is to provide detailed recipe recommendations.
    Based on the user's available ingredients and the context provided from the recipe database,
    create a complete and easy-to-follow recipe.

    Your response MUST be formatted as a JSON object, adhering to the following schema:
    {format_instructions}

    If the provided context is insufficient to create a full recipe, return a JSON object
    with 'recipe_name' as "Insufficient Information" and provide a message in 'chef_tip'
    explaining what information is needed or suggesting a simpler dish.

    Context:
    {context}
    """

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}")
    ]).partial(format_instructions=parser.get_format_instructions()) # Add format instructions to the prompt

    # Chain with the parser at the end
    first_chain = create_stuff_documents_chain(llm, prompt_template)
    rag_chain = create_retrieval_chain(retriever, first_chain) | RunnableLambda(lambda x: x["answer"]) | parser # Add the parser to the chain

    st.header("Get Your Recipe Recommendation!")
    ingredients_query = st.text_area("Tell me what ingredients you have available (e.g., 'chicken, rice, broccoli, soy sauce'):", height=100)

    if st.button("Get Recipe"):
        if ingredients_query:
            with st.spinner("Searching for recipes and generating recommendations..."):
                try:
                    result = rag_chain.invoke({"input": ingredients_query, "format_instructions": parser.get_format_instructions()})
                    st.subheader("Your Recommended Recipe:")
                    #st.write(result)
                    #Display the parsed JSON output
                    if isinstance(result, dict):
                        if result.get("recipe_name") == "Insufficient Information":
                            st.warning(f"**{result.get('recipe_name')}**: {result.get('chef_tip')}")
                        else:
                            st.json(result) # Display the raw JSON for clarity
                            st.markdown(f"### {result.get('recipe_name', 'N/A')}")
                            st.markdown(f"**Estimated Total Time**: {result.get('estimated_total_time', 'N/A')}")
                            st.markdown("**Ingredients:**")
                            for item in result.get('ingredients', []):
                                st.markdown(f"- {item}")
                            st.markdown("**Instructions:**")
                            for i, step in enumerate(result.get('instructions', [])):
                                st.markdown(f"{i+1}. {step}")
                            st.markdown(f"**Nutrition Information**: {result.get('nutrition_information', 'N/A')}")
                            if result.get('chef_tip'):
                                st.markdown(f"**Chef's Tip**: {result.get('chef_tip')}")
                    else:
                        st.error("The model did not return a valid JSON object.")
                        st.write(result) # Show raw output if parsing failed

                    # Optional: Display retrieved documents for debugging/transparency
                    with st.expander("See Retrieved Documents (for debugging)"):
                        # Note: 'context' is part of the result from create_retrieval_chain,
                        # but after piping to parser, it might not be directly accessible in 'result'.
                        # You might need to inspect the chain before the parser if you want to show context.
                        st.write("Context display is not directly available after JSON parsing in this setup.")

                except Exception as e:
                    st.error(f"An error occurred while generating the recipe: {e}")
                    st.write("Please ensure the model output adheres to the specified JSON format.")
        else:
            st.warning("Please enter some ingredients to get a recommendation.")

    st.markdown("---")
    st.header("Add Your Own Recipe/Ingredient Info (Optional)")
    user_recipe_name = st.text_input("Recipe Name (optional):")
    user_input_text = st.text_area("Enter any recipe details, ingredients, or cooking tips you want to add to the database:", height=150)

    if st.button("Add to Database"):
        if user_input_text:
            metadata = {"source": "user_contribution"}
            if user_recipe_name:
                metadata["recipe_name"] = user_recipe_name
            insert_user_input_into_vector_db(st.session_state.vector_db, user_input_text, metadata)
        else:
            st.warning("Please enter some text to add to the database.")

else:
    st.error("Failed to initialize the vector database. Please check your CSV file and API key.")