from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Union
class Recipe(BaseModel):
    recipe_name: str = Field(description="The name of the recipe.")
    estimated_total_time: str = Field(description="Estimated total time for preparation and cooking.")
    ingredients: list[str] = Field(description="A list of ingredients with quantities.")
    instructions: list[str] = Field(description="Step-by-step cooking instructions.")
    nutrition_information: str = Field(description="Nutritional breakdown (calories, carbs, protein, fat) or 'Not available'.")
    chef_tip: str = Field(description="An optional helpful tip related to the recipe.")


class RecipeRecommendationRequest(BaseModel):
    ingredients: str = Field(..., description="Comma-separated list of ingredients available.")

class RecipeRecommendationResponse(BaseModel):
    recipe: Recipe = Field(..., description="The detailed recipe recommendation.")

class AddRecipeInfoRequest(BaseModel):
    user_input_text: str = Field(..., description="Any recipe details, ingredients, or cooking tips to add.")
    recipe_name: Optional[str] = Field(None, description="Optional name for the recipe being added.")
    recipe_id: Optional[str] = Field(None, description="Optional recipe id for the recipe being added.")

class AddRecipeInfoResponse(BaseModel):
    success: bool = Field(..., description="True if the information was added successfully, False otherwise.")
    message: str = Field(..., description="A message indicating the result of the operation.")

class APIResponse(BaseModel):
    status: str
    message: str
    data: Optional[Union[Recipe, Dict]] = None