import React from 'react';
import ModalBase from './ModalBase';
import { useModal } from '../../hooks/useModal';
import { useAppContext } from '../../context/AppContext';
import Button from '../common/Button';

function RecipeDetailModal() {
  const { state, dispatch } = useAppContext();
  const { isModalOpen, closeModal, openModal } = useModal();
  const currentRecipe = state.recipes.currentRecipe;

  const handleEdit = () => {
    dispatch({
      type: 'SET_CURRENT_RECIPE',
      payload: { recipe: currentRecipe, isEditing: true }
    });
    closeModal('recipeDetail');
    openModal('recipe');
  };

  const handleClose = () => {
    closeModal('recipeDetail');
    dispatch({
      type: 'SET_CURRENT_RECIPE',
      payload: { recipe: null, isEditing: false }
    });
  };

  if (!currentRecipe) {
    return null;
  }

  return (
    <ModalBase 
      isOpen={isModalOpen('recipeDetail')} 
      onClose={handleClose}
    >
      <h2 id="detailRecipeTitle">{currentRecipe.title}</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <p>
          <strong>Description:</strong>{' '}
          <span id="detailRecipeDescription">
            {currentRecipe.description || 'No description provided.'}
          </span>
        </p>
        
        <p>
          <strong>Cuisine:</strong>{' '}
          <span id="detailRecipeCuisine">
            {currentRecipe.cuisine_type || 'N/A'}
          </span>
        </p>
        
        <p>
          <strong>Difficulty:</strong>{' '}
          <span id="detailRecipeDifficulty">
            {currentRecipe.difficulty_level || 'N/A'}
          </span>
        </p>
        
        <p>
          <strong>Prep Time:</strong>{' '}
          <span id="detailRecipePrepTime">
            {currentRecipe.prep_time_minutes ? `${currentRecipe.prep_time_minutes} mins` : 'N/A'}
          </span>
        </p>
        
        <p>
          <strong>Cook Time:</strong>{' '}
          <span id="detailRecipeCookTime">
            {currentRecipe.cook_time_minutes ? `${currentRecipe.cook_time_minutes} mins` : 'N/A'}
          </span>
        </p>
        
        <p>
          <strong>Servings:</strong>{' '}
          <span id="detailRecipeServings">
            {currentRecipe.servings || 'N/A'}
          </span>
        </p>

        <p>
          <strong>Public:</strong>{' '}
          <span>
            {currentRecipe.is_public ? 'Yes' : 'No'}
          </span>
        </p>
      </div>

      {currentRecipe.image_url && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            id="detailRecipeImage"
            src={currentRecipe.image_url}
            alt="Recipe"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '5px',
              border: '1px solid #eee'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <h3>Instructions & Ingredients:</h3>
      <pre id="detailRecipeInstructions" style={{
        backgroundColor: '#f0f0f0',
        padding: '15px',
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        fontFamily: 'monospace',
        fontSize: '0.9em',
        maxHeight: '300px',
        overflowY: 'auto',
        marginBottom: '20px'
      }}>
        {currentRecipe.instructions || 'No instructions provided.'}
      </pre>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'flex-end',
        borderTop: '1px solid #eee',
        paddingTop: '15px'
      }}>
        <Button
          onClick={handleEdit}
          className="btn-warning"
          icon="fas fa-edit"
        >
          Edit Recipe
        </Button>
        <Button
          onClick={handleClose}
          className="btn-secondary"
        >
          Close
        </Button>
      </div>
    </ModalBase>
  );
}

export default RecipeDetailModal;