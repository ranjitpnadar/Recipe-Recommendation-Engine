// controllers/recipeController.js
const RecipeService = require('../services/recipeService');
const errorHandler = require('../utils/errorHandler');

class RecipeController {
    static async createRecipe(req, res) {
        try {
            let  reqData = req.body;
            // Ensure the recipe is associated with the authenticated user
            const recipeData = {
                userId: req.user.userId, // Map to userId
                title: reqData.title,
                description: reqData.description,
                instructions: reqData.instructions,
                prepTimeMinutes: reqData.prep_time_minutes,
                cookTimeMinutes: reqData.cook_time_minutes,
                servings: reqData?.servings || null,
                imageUrl: reqData?.image_url || null,
                cuisineType: reqData?.cuisine_type,
                difficultyLevel: reqData.difficulty_level, // Prisma handles ENUM directly
            }
            const recipe = await RecipeService.createRecipe(recipeData);
            const response = {
                "status": "success",
                "message": "Resource created successfully.",
                "data": recipe
            }
            const llm_response = await RecipeService.createRecipeWithLLM(recipe);
            console.log("65===>",llm_response);
            res.status(201).json(response);
        } catch (error) {
            errorHandler(res, error, 400);
        }
    }

    static async getRecipe(req, res) {
        try {
            const recipe = await RecipeService.getRecipeById(req.params.id);
            const response = {
                "status": "success",
                "message": "User recipe detail retrieved successfully",
                "data": recipe
            }
            res.status(200).json(response);
        } catch (error) {
            errorHandler(res, error, 404);
        }
    }

    static async getAllRecipes(req, res) {
        try {
            const { limit, offset, userId, isPublic, search } = req.query;
            const options = {
                limit: parseInt(limit) || 10,
                offset: parseInt(offset) || 0,
                userId: userId,
                isPublic: isPublic === 'true' ? true : (isPublic === 'false' ? false : undefined),
                search: search
            };
            const recipes = await RecipeService.getAllRecipes(options);
            const response = {
                "status": "success",
                "message": "User recipes detail retrieved successfully",
                "data": recipes
            }
            res.status(200).json(response);
        } catch (error) {
            errorHandler(res, error, 500);
        }
    }

    static async updateRecipe(req, res) {
        try {
            let  recipeData = req.body;
            const recipeId = req.params.id;

            // Optional: Add authorization check here to ensure user owns the recipe
            const existingRecipe = await RecipeService.getRecipeById(recipeId);
            if (!existingRecipe || existingRecipe.user_id !== req.user.user_id) {
                return res.status(403).json({ message: 'Unauthorized to update this recipe.' });
            }

            const updatedRecipe = await RecipeService.updateRecipe(recipeId, recipeData);
            const response = {
                "status": "success",
                "message": "Recipe updated successfully.",
                "data": updatedRecipe
            }
            res.status(200).json(response);
        } catch (error) {
            errorHandler(res, error, 400);
        }
    }

    static async deleteRecipe(req, res) {
        try {
            const recipeId = req.params.id;

            // Optional: Add authorization check here to ensure user owns the recipe
            const existingRecipe = await RecipeService.getRecipeById(recipeId);
            if (!existingRecipe || existingRecipe.user_id !== req.user.user_id) {
                return res.status(403).json({ message: 'Unauthorized to delete this recipe.' });
            }

            await RecipeService.deleteRecipe(recipeId);
            const response = {
                "status": "success",
                "message": "Recipe deleted successfully."
            }
            res.status(200).json(response);
        } catch (error) {
            errorHandler(res, error, 500);
        }
    }

    // --- LLM Search Endpoint ---
    static async searchRecipesLLM(req, res) {
        try {
            const { query } = req.body; // User's raw search query
            if (!query) {
                return res.status(400).json({ message: 'Search query is required.' });
            }
            const userId = req.user.user_id; // Get user ID from authenticated request
            const recommendedRecipes = await RecipeService.searchRecipesWithLLM(userId, query);
            const response = {
                "status": "success",
                "message": "Recipe recommendation based on user-entered ingredients"
            }
            if(recommendedRecipes.status == 'failure'){
                response['status'] = 'failure';
                response['message'] = 'Failed to fetch recipe for entered ingredients ';
                res.status(200).json(response);
            }else{
                response['data'] = recommendedRecipes
                res.status(200).json(response)
            }
        } catch (error) {
            errorHandler(res, error, 500);
        }
    }

    static async trackRecommendationClick(req, res) {
        try {
            const { recommendationId } = req.params;
            await RecipeService.trackRecommendationClick(recommendationId);
             const response = {
                "status": "success",
                "message": "Recommendation click tracked successfully."
            }
            res.status(200).json(response);
        } catch (error) {
            errorHandler(res, error, 500);
        }
    }
}

module.exports = RecipeController;