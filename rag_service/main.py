from fastapi import FastAPI, HTTPException, status
from contextlib import asynccontextmanager
from typing import Dict, Any
# from langchain_core.output_parsers import JsonOutputParser
# from fastapi.responses import StreamingResponse # Import StreamingResponse

from config import embedding_model, llm, CHROMA_DB_DIR, CSV_FILE_PATH
from vector_db_manager import check_and_load_vector_db, insert_user_input_into_vector_db
from llm_chain_manager import setup_rag_chain

from models import RecipeRecommendationRequest, RecipeRecommendationResponse, AddRecipeInfoRequest, AddRecipeInfoResponse, APIResponse # Import Recipe model

global_vector_db = None
global_rag_chain = None

@asynccontextmanager
async def init_setup(app: FastAPI):
    global global_vector_db, global_rag_chain

    try:
        global_vector_db = check_and_load_vector_db(CHROMA_DB_DIR, embedding_model, CSV_FILE_PATH)
        if global_vector_db:
            global_rag_chain = setup_rag_chain(llm, global_vector_db)
            print("Components initialized successfully.")
        else:
            print("Failed to initialize vector database. API will not function correctly.")
    except Exception as e:
        print(f"Error during startup initialization: {e}")
    yield
    print("Application Shutting down")


app = FastAPI(
    title="Recipe Recommendation API",
    description="API for getting recipe recommendations and adding new recipes",
    version="1.0.0",
    lifespan=init_setup
)



@app.get("/")
async def read_root():
    return {"message": "Welcome to the Recipe Recommender API! Visit /docs for API documentation."}

# @router.post("/get_recipe", summary="Get a recipe recommendation (streaming)",
#              response_description="Streams text chunks and then the final parsed recipe JSON.")
# async def get_recipe_recommendation_streaming(
#     query: RecipeRecommendationRequest,
#     vector_db_instance = Depends(get_db_initialized) # Use dependency injection
# ):
#     """
#     Get a recipe recommendation based on provided ingredients.
#     The response is streamed, sending text chunks as they are generated,
#     followed by the final parsed JSON recipe object.
#     """
#     try:
#         # The generator yields JSON strings, each ending with a newline
#         return StreamingResponse(
#             setup_rag_chain.stream_recipe_generation(vector_db_instance, query.ingredients),
#             media_type="application/x-ndjson" # Newline Delimited JSON
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to start streaming recipe generation: {e}")

@app.post("/recommend_recipe", response_model=APIResponse, status_code=status.HTTP_200_OK)
async def recommend_recipe(request: RecipeRecommendationRequest):
    """
    Provides a recipe recommendation based on available ingredients.
    """
    if not global_rag_chain:
        raise HTTPException(
            status_code=status.HTTP_505_HTTP_VERSION_NOT_SUPPORTED,
            detail="Recipe recommendation service is not initialized. Please check server logs."
        )
    
    if not request.ingredients.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ingredients cannot be empty"
        )
    print(request.ingredients)
    try:
        result = global_rag_chain.invoke({"input": request.ingredients})
        # recipe_answer = result.get('answer', 'No recipe found based on your ingredients. Please try different ingredients or add more information to the database.')
        print(result)
        # print(isinstance(result, Recipe))
        return APIResponse(
            status="success",
            message="Recipe generated successfully.",
            data=result
        )
        # return RecipeRecommendationResponse(recipe=recipe_answer)
    except Exception as e:
        print(f"Error during recipe recommendation: {e}")
        # raise HTTPException(
        #     status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        #     detail=f"An error occurred while generating the recipe: {e}"
        # )
        return APIResponse(
            status="warning",
            message="Insufficient information to generate a full recipe.",
            data=result
        )

@app.post("/add_recipe_info", response_model=APIResponse, status_code=status.HTTP_200_OK)
async def add_recipe_info(request: AddRecipeInfoRequest):
    """
    Adds new recipe details or ingredient information to the vector database.
    """
    if not global_vector_db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is not initialized. Please check server logs."
        )
    
    if not request.user_input_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User input text cannot be empty."
        )
    
    metadata = {"source": "user_contribution"}
    
    if request.recipe_name:
        metadata["recipe_name"] = request.recipe_name
        metadata["recipe_id"] = request.recipe_id
    
    success = insert_user_input_into_vector_db(global_vector_db, request.user_input_text, metadata)
    print(success)
    try:
        if success:
            print(request.recipe_name, request.recipe_id)
            return APIResponse(
                status="success",
                message="Information successfully added to the database."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add information to the database. Check server logs for details."
            )
    except Exception as e:
        print(f"An unexpected error occurred while adding data to DB: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {e}"
        )