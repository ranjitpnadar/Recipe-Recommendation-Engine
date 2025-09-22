# config.py
import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

# Load environment variables
load_dotenv()

# --- API Keys and Models ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables. Please set it.")

# Initialize Embedding Model
embedding_model = OpenAIEmbeddings(api_key=OPENAI_API_KEY)

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", api_key=OPENAI_API_KEY, temperature=0.5)

# --- Constants ---
CHROMA_DB_DIR = "recipe_db"
CSV_FILE_PATH = "recipes.csv"