import React, { useState, useEffect } from 'react';
import ModalBase from './ModalBase';
import { useModal } from '../../hooks/useModal';
import { useApi } from '../../hooks/useApi';
import { useAppContext } from '../../context/AppContext';
import Button from '../common/Button';

function MyRecipesModal() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { dispatch } = useAppContext();
  const { isModalOpen, closeModal, openModal } = useModal();
  const { makeApiRequest } = useApi();

  const loadRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      const recipesData = await makeApiRequest('GET', '/recipes', null, true);
      setRecipes(recipesData);
    } catch (err) {
      setError(`Failed to load recipes: ${err.message}`);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen('myRecipes')) {
      loadRecipes();
    }
  }, [isModalOpen('myRecipes')]);

  const handleViewRecipe = (recipe) => {
    dispatch({
      type: 'SET_CURRENT_RECIPE',
      payload: { recipe, isEditing: false }
    });
    openModal('recipeDetail');
  };

  const handleEditRecipe = (recipe) => {
    dispatch({
      type: 'SET_CURRENT_RECIPE',
      payload: { recipe, isEditing: true }
    });
    openModal('recipe');
  };

  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${recipeTitle}"?`)) {
      return;
    }

    try {
      await makeApiRequest('DELETE', `/recipes/${recipeId}`, null, true);
      alert('Recipe deleted successfully!');
      loadRecipes(); // Refresh the list
    } catch (err) {
      alert(`Failed to delete recipe: ${err.message}`);
    }
  };

  const renderRecipeRow = (recipe) => (
    <tr key={recipe.recipe_id}>
      <td>{recipe.title}</td>
      <td>{recipe.cuisine_type || 'N/A'}</td>
      <td>{recipe.difficulty_level || 'N/A'}</td>
      <td>
        {recipe.prep_time_minutes ? `${recipe.prep_time_minutes} min` : 'N/A'}
      </td>
      <td>
        {recipe.cook_time_minutes ? `${recipe.cook_time_minutes} min` : 'N/A'}
      </td>
      <td>{recipe.servings || 'N/A'}</td>
      <td className="action-buttons">
        <Button
          onClick={() => handleViewRecipe(recipe)}
          className="btn-info"
          style={{ marginRight: '5px', padding: '8px 12px', fontSize: '0.9em' }}
        >
          View
        </Button>
        <Button
          onClick={() => handleEditRecipe(recipe)}
          className="btn-warning"
          style={{ marginRight: '5px', padding: '8px 12px', fontSize: '0.9em' }}
        >
          Edit
        </Button>
        <Button
          onClick={() => handleDeleteRecipe(recipe.recipe_id, recipe.title)}
          className="btn-danger"
          style={{ padding: '8px 12px', fontSize: '0.9em' }}
        >
          Delete
        </Button>
      </td>
    </tr>
  );

  return (
    <ModalBase 
      isOpen={isModalOpen('myRecipes')} 
      onClose={() => closeModal('myRecipes')}
      className="large-modal"
    >
      <h2>My Recipes</h2>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading recipes...
        </div>
      )}

      {error && (
        <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="recipes-table-container">
          {recipes.length === 0 ? (
            <p id="noMyRecipesMessage">
              No recipes found. Add one to get started!
            </p>
          ) : (
            <table id="myRecipesTable">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Cuisine</th>
                  <th>Difficulty</th>
                  <th>Prep Time</th>
                  <th>Cook Time</th>
                  <th>Servings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map(renderRecipeRow)}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button
          onClick={() => {
            dispatch({
              type: 'SET_CURRENT_RECIPE',
              payload: { recipe: null, isEditing: false }
            });
            openModal('recipe');
          }}
          className="btn-success"
          icon="fas fa-plus"
        >
          Add New Recipe
        </Button>
      </div>
    </ModalBase>
  );
}

export default MyRecipesModal;