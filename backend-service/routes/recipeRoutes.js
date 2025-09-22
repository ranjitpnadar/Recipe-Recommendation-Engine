// routes/recipeRoutes.js
const express = require('express');
const RecipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Protected routes (require authentication)
router.post('/', authMiddleware, RecipeController.createRecipe);
router.put('/:id', authMiddleware, RecipeController.updateRecipe);
router.delete('/:id', authMiddleware, RecipeController.deleteRecipe);

router.post('/search-llm', authMiddleware, RecipeController.searchRecipesLLM);
// LLM Search route
router.post('/recommendations/:recommendationId/click', authMiddleware, RecipeController.trackRecommendationClick);


// Public routes (can be accessed without authentication, e.g., for browsing)
// router.get('/', RecipeController.getAllRecipes); // Can filter by userId or isPublic
// router.get('/:id', RecipeController.getRecipe);

module.exports = router;