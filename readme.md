
# Recipe Recommendation Engine

> A recipe recommendation engine combining a backend service and a RAG-style (retrieval-augmented generation) service to provide personalized recipe suggestions.

**Repository structure (high level)**

* `backend-service/` — core backend (REST API, DB integrations, web service). ([GitHub][2])
* `rag_service/` — retrieval & LLM orchestration (embeddings, vector store, prompts, RAG orchestration). ([GitHub][3])

---

## Quick overview

This project provides a modular stack for generating recipe recommendations based on user inputs (ingredients, preferences, dietary constraints) by combining retrieval techniques and generative models. It is split into a classical backend API layer and a RAG/ML service so components can be developed, tested, and deployed independently.

---

## Features

* REST API endpoints to request and receive recipe recommendations (see `backend-service`).
* RAG-style retrieval service that uses embeddings + vector store to surface relevant recipe content and uses an LLM for final generation/completion (see `rag_service`).
* Docker-friendly layout for local development and deployment.
* Designed for extension — swap vector stores, LLM providers, or frontends.

---

## Prerequisites

* Python 3.10+ (match project's `requirements.txt` if present)
* Docker & Docker Compose (optional but recommended for dev + prod parity)
* An LLM provider/API key (OpenAI, Anthropic, or other) for the RAG service
* (Optional) A vector database (e.g., Weaviate, Milvus, Pinecone) or local FAISS/Chroma depending on implementation

> NOTE: Exact dependency files and runtime versions live in each subfolder (check `backend-service/requirements.txt` or `rag_service/requirements.txt` if present). ([GitHub][2])

---

## Getting started (local development)

### 1. Clone repository

```bash
git clone https://github.com/ranjitpnadar/Recipe-Recommendation-Engine.git
cd Recipe-Recommendation-Engine
git checkout develop
```

(Repo overview referenced here). ([GitHub][1])

---

### 2. Backend service (basic steps)

1. Change into backend folder:

   ```bash
   cd backend-service
   ```

2. Create & activate a virtual environment:

   ```bash
   python -m venv .venv
   source .venv/bin/activate   # macOS / Linux
   .venv\Scripts\activate      # Windows (PowerShell)
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Add environment variables (example `.env`):

   ```
   FLASK_APP=app.py             # or your entrypoint
   FLASK_ENV=development
   DATABASE_URL=postgresql://user:pass@localhost:5432/recipes
   SECRET_KEY=your-secret-key
   RAG_SERVICE_URL=http://localhost:8001  # example where rag_service is served
   ```

   Adjust variable names to match your code.

5. Run the service:

   ```bash
   # if Flask
   flask run --host=0.0.0.0 --port=8000

   # or if using gunicorn/uvicorn:
   gunicorn -w 4 backend_service.app:app
   ```

   Check the actual entrypoint inside `backend-service` (e.g., `app.py`, `main.py`). ([GitHub][2])

---

### 3. RAG service (basic steps)

1. Change into rag folder:

   ```bash
   cd ../rag_service
   ```

2. Set up virtualenv and install:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Environment variables (example):

   ```
   OPENAI_API_KEY=sk-...
   VECTOR_DB_URL=http://localhost:6333   # if using a hosted vector DB
   EMBEDDING_MODEL=all-mpnet-base-v2     # example
   RAG_HOST=0.0.0.0
   RAG_PORT=8001
   ```

4. Start the service (example):

   ```bash
   python run_rag_service.py
   # or
   uvicorn rag_service.app:app --host 0.0.0.0 --port 8001 --reload
   ```

   Inspect `rag_service` for the exact run command. ([GitHub][3])

---

## Running with Docker (recommended for parity)

If the repo includes `Dockerfile` / `docker-compose.yml` at service level, you can run both services in containers.

Example `docker-compose` usage (example only):

```bash
# from repo root (if docker-compose.yml exists)
docker-compose up --build
```

If no compose file exists, build and run each service Dockerfile separately:

```bash
# build
docker build -t recipe-backend ./backend-service
docker build -t recipe-rag ./rag_service

# run (example)
docker run -e DATABASE_URL=... -p 8000:8000 recipe-backend
docker run -e OPENAI_API_KEY=... -p 8001:8001 recipe-rag
```

---

## Example API usage

> Replace paths & port with actual endpoints implemented inside `backend-service`.

**Request recommendations**

```bash
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["tomato", "basil", "mozzarella"],
    "diet": "vegetarian",
    "max_results": 5
  }'
```

**Possible response** (example)

```json
{
  "recommendations": [
    {
      "id": "r123",
      "title": "Caprese Salad",
      "score": 0.97,
      "ingredients": ["tomato", "basil", "mozzarella", "olive oil", "salt"],
      "instructions": "..."
    },
    ...
  ]
}
```

If the backend proxies to the RAG service, the backend will typically call an internal RAG endpoint such as:

```
POST http://{RAG_SERVICE_HOST}:{RAG_PORT}/v1/query
body: { "query": "...", "context_filters": {...} }
```

Adjust to the actual implementation in `rag_service`. ([GitHub][2])

---

## Environment / Configuration (suggested)

Keep secrets out of source control. Add a `.env.example` with the variables you expect. Common variables:

* `DATABASE_URL` — Postgres/MySQL URI
* `REDIS_URL` — Redis for caching / queues
* `OPENAI_API_KEY` (or provider key)
* `VECTOR_DB_ENDPOINT` — vector DB host
* `RAG_SERVICE_URL` — backend → rag service
* `SECRET_KEY` — app secret

---

## Tests

If tests exist in the repo, run with:

```bash
pytest
# or a tox/make target if present
```

Add unit tests for:

* endpoint behavior
* retriever + embedding logic
* vector store indexing/querying
* integration tests (backend ↔ rag)

---

## Development notes & tips

* Keep the RAG index up-to-date whenever recipe data changes (reindex job). Consider using an async worker (Celery / RQ) for large imports.
* Use low-cost embedding models for bulk indexing, high-quality/LLM for final generation.
* Add schema validation on input (Pydantic / Marshmallow) to avoid malformed queries.
* Consider rate-limiting LLM calls and caching results for repeated queries.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-change`
3. Add tests and documentation for your change
4. Open a PR describing the change

Please follow a standard commit message and include a short description of the testing you performed.

---

## Troubleshooting

* `Connection errors` to vector DB: confirm service is running and correct endpoint/credentials are set in env.
* `LLM authorization errors`: verify the provider key and any required headers or org IDs.
* `Performance`: add caching for repeated queries and batch embedding requests during indexing.

---

## Roadmap / Ideas

* Add user profiles and collaborative filtering signals.
* Add nutritional analysis / calorie estimation.
* Add UI (web/mobile) with saved favorites & shopping list export.
* Multi-language support for recipe generation.

---

## License & Authors

* Author: `ranjitpnadar` (repository at `ranjitpnadar/Recipe-Recommendation-Engine`). ([GitHub][1])
* Add a license file (e.g., `MIT` or whichever you prefer) if not already present.
