# 🍲 Recipe Recommendation RAG Service

This project provides a **Retrieval-Augmented Generation (RAG)** powered API for recipe recommendations. Users can input ingredients, and the service suggests recipes using a combination of a vector database and an LLM. It also allows users to contribute new recipe knowledge to improve future recommendations.

---

## 🚀 Features

* **Recipe Recommendations** — Get recipe suggestions based on ingredients.
* **Knowledge Expansion** — Add new recipe information to enrich the vector database.
* **FastAPI + LangChain** — Modern API framework with LLM-powered RAG pipelines.
* **ChromaDB** — Vector database backend for semantic retrieval.
* **Dockerized Deployment** — Easily run with Docker or Docker Compose.

---

## 📂 Project Structure

```
.
├── .env                  # Environment variables (API keys, configs)
├── config.py             # Configuration for embeddings, LLMs, paths
├── docker-compose.yml    # Docker Compose setup
├── Dockerfile            # Docker image definition
├── llm_chain_manager.py  # Setup of RAG chain with LangChain
├── main.py               # FastAPI entrypoint (API routes)
├── models.py             # Pydantic models for API requests/responses
├── recipes.csv           # Initial recipe dataset
├── requirements.txt      # Python dependencies
├── user_data.py          # User data handling
├── vector_db_manager.py  # Vector DB management (ChromaDB)
```

---

## ⚙️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/rag_service.git
cd rag_service
```

### 2. Create a `.env` file

Provide your API keys and configs (example):

```env
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_DB_DIR=./chroma_db
CSV_FILE_PATH=./recipes.csv
```

### 3. Install dependencies (local dev)

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

pip install -r requirements.txt
```

### 4. Run the service

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit API docs at 👉 [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🐳 Docker Setup

### Build and run with Docker

```bash
docker build -t rag_service .
docker run -p 8000:8000 rag_service
```

### Or with Docker Compose

```bash
docker-compose up --build
```

---

## 📡 API Endpoints

### `GET /`

Health check & welcome message.

### `POST /recommend_recipe`

**Request:**

```json
{
  "ingredients": "chicken, garlic, rice"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Recipe generated successfully.",
  "data": {
    "recipe": "Garlic Chicken Rice Bowl ..."
  }
}
```

### `POST /add_recipe_info`

**Request:**

```json
{
  "user_input_text": "A traditional lentil soup with carrots and celery."
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Recipe added successfully.",
  "data": {}
}
```

---

## 🛠 Tech Stack

* [FastAPI](https://fastapi.tiangolo.com/) — Web framework
* [LangChain](https://www.langchain.com/) — LLM orchestration
* [ChromaDB](https://www.trychroma.com/) — Vector database
* [OpenAI](https://platform.openai.com/) — LLM & embeddings
* [Docker](https://www.docker.com/) — Containerized deployment

---

## 📌 Roadmap

* [ ] Add recipe recommendation streaming responses
* [ ] Enhance metadata storage for recipes
* [ ] Integrate authentication for user contributions
* [ ] Support multiple LLM providers (Anthropic, Llama, etc.)

---

## 🤝 Contributing

Pull requests are welcome!
For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License

MIT License — feel free to use, modify, and distribute.
