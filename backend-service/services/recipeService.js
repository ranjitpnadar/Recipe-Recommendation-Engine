// services/recipeService.js
const prisma = require('../config/prismaClient');
const axios = require('axios');
const redisClient = require('../config/redisClient');
class RecipeService {
    /**
     * Maps request data to Prisma-compatible format.
     * @param {Object} data The incoming data from the controller.
     * @returns {Object} The formatted data for Prisma.
     */
    static #mapRecipeData(data) {
        return {
            userId: data.userId,
            title: data.title,
            description: data.description,
            instructions: data.instructions,
            prepTimeMinutes: data.prepTimeMinutes,
            cookTimeMinutes: data.cookTimeMinutes,
            servings: data.servings,
            imageUrl: data.imageUrl,
            cuisineType: data.cuisineType,
            difficultyLevel: data.difficultyLevel,
            isPublic: data.isPublic || false,
        };
    }

    static async createRecipe(recipeData) {
        try {
            const data = this.#mapRecipeData(recipeData);
            const newRecipe = await prisma.recipe.create({ data });
            //Invalidate cache from all users
            redisClient.keys('recipe_search:*').then((keys) => {
                keys.forEach((key) => {
                    redisClient.del(key);
                });
            })
            return newRecipe;
        } catch (error) {
            throw new Error(`Error creating recipe: ${error.message}`);
        }
    }

    static async getRecipeById(recipeId) {
        try {
            const recipe = await prisma.recipe.findUnique({
                where: { recipeId },
            });
            if (!recipe) {
                throw new Error('Recipe not found.');
            }
            return recipe;
        } catch (error) {
            // Prisma throws a P2025 error if the record is not found for delete, but for findUnique it just returns null.
            // A more general error handler is sufficient here.
            throw new Error(`Error fetching recipe: ${error.message}`);
        }
    }

    static async getAllRecipes(options = {}) {
        try {
            const { limit, offset, userId, isPublic, search } = options;
            const whereClause = {};

            if (userId) {
                whereClause.userId = userId;
            }
            if (isPublic !== undefined) {
                whereClause.isPublic = isPublic;
            }
            if (search) {
                whereClause.title = { contains: search, mode: 'insensitive' };
            }

            const recipes = await prisma.recipe.findMany({
                where: whereClause,
                take: limit,
                skip: offset,
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return recipes;
        } catch (error) {
            throw new Error(`Error fetching recipes: ${error.message}`);
        }
    }

    static async updateRecipe(recipeId, recipeData) {
        try {
            const updatedRecipe = await prisma.recipe.update({
                where: { recipeId },
                data: this.#mapRecipeData(recipeData),
            });
            //Invalidate cache from all users
            redisClient.keys('recipe_search:*').then((keys) => {
                keys.forEach((key) => {
                    redisClient.del(key);
                });
            })
            return updatedRecipe;
        } catch (error) {
            if (error.code === 'P2025') {
                throw new Error('Recipe not found.');
            }
            throw new Error(`Error updating recipe: ${error.message}`);
        }
    }

    static async deleteRecipe(recipeId) {
        try {
            await prisma.recipe.delete({
                where: { recipeId },
            });
            return { message: 'Recipe deleted successfully.' };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new Error('Recipe not found.');
            }
            throw new Error(`Error deleting recipe: ${error.message}`);
        }
    }

    // --- LLM Search Integration ---
    static async searchRecipesWithLLM(userId, rawQuery) {
        try {
            const cacheKey = `recipe_search:${userId}:${rawQuery}`;
            const cachedResult = await redisClient.get(cacheKey);
            if(cachedResult){
                console.log('returning response from cache.')
                return JSON.parse(cachedResult);
            }
            const recipeRecommendationUrl = process.env.RECIPE_HOST + "recommend_recipe";
            const requestData = {
                "ingredients": rawQuery,
                "user_id": userId
            };

            const config = {
                method: 'post',
                url: recipeRecommendationUrl,
                headers: { 'Content-Type': 'application/json' },
                data: requestData
            };

            const response = await axios.request(config);
            await redisClient.set(cacheKey, JSON.stringify(response.data), {EX: 3600});
            return response.data;
        } catch (error) {
            // Throw a custom error with a clearer message
            throw new Error('Failed to connect to the external recipe recommendation service.');
        }
    }
    static async createRecipeWithLLM(recipeData) {
        try {
            const recipeRecommendationUrl = process.env.RECIPE_HOST + "add_recipe_info";
            const user_recipe_detail = recipeData.description
            const requestData = {
                "recipe_name": recipeData.title,
                "user_input_text": user_recipe_detail.trim(),
                "recipe_id": recipeData.recipeId
            };
            console.log("143=>", requestData)
            const config = {
                method: 'post',
                url: recipeRecommendationUrl,
                headers: { 'Content-Type': 'application/json' },
                data: requestData
            };

            const response = await axios.request(config);
            return response.data;
        } catch (error) {
            console.log(error.message)
            throw new Error('Failed to connect to the external recipe create service.');
        }
    }
    static async trackRecommendationClick(recommendationId) {
        try {
            await prisma.searchRecommendation.update({
                where: { recommendationId },
                data: {
                    clicked: true,
                    clickedAt: new Date(),
                },
            });
            return { message: 'Recommendation click tracked.' };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new Error('Recommendation not found.');
            }
            throw new Error(`Error tracking click: ${error.message}`);
        }
    }
}

module.exports = RecipeService;