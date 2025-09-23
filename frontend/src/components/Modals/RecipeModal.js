import React, { useState, useEffect } from 'react';
import ModalBase from './ModalBase';
import { useModal } from '../../hooks/useModal';
import { useApi } from '../../hooks/useApi';
import { useAppContext } from '../../context/AppContext';
import Button from '../common/Button';

function RecipeModal() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    prep_time_minutes: '',
    cook_time_minutes: '',
    servings: '',
    image_url: '',
    cuisine_type: '',
    difficulty_level: '',
    is_public: false
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const { state, dispatch } = useAppContext();
  const { isModalOpen, closeModal } = useModal();
  const { makeApiRequest } = useApi();

  const isEditing = state.recipes.isEditing;
  const currentRecipe = state.recipes.currentRecipe;

  useEffect(() => {
    if (isEditing && currentRecipe) {
      setFormData({
        title: currentRecipe.title || '',
        description: currentRecipe.description || '',
        instructions: currentRecipe.instructions || '',
        prep_time_minutes: currentRecipe.prep_time_minutes || '',
        cook_time_minutes: currentRecipe.cook_time_minutes || '',
        servings: currentRecipe.servings || '',
        image_url: currentRecipe.image_url || '',
        cuisine_type: currentRecipe.cuisine_type || '',
        difficulty_level: currentRecipe.difficulty_level || '',
        is_public: currentRecipe.is_public || false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        instructions: '',
        prep_time_minutes: '',
        cook_time_minutes: '',
        servings: '',
        image_url: '',
        cuisine_type: '',
        difficulty_level: '',
        is_public: false
      });
    }
  }, [isEditing, currentRecipe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const recipeData = {
      ...formData,
      prep_time_minutes: parseInt(formData.prep_time_minutes) || null,
      cook_time_minutes: parseInt(formData.cook_time_minutes) || null,
      servings: parseInt(formData.servings) || null,
    };

    try {
      if (isEditing && currentRecipe) {
        await makeApiRequest('PUT', `/recipes/${currentRecipe.recipe_id}`, recipeData, true);
        setMessage({ text: 'Recipe updated successfully!', type: 'success' });
      } else {
        await makeApiRequest('POST', '/recipes', recipeData, true);
        setMessage({ text: 'Recipe added successfully!', type: 'success' });
      }
      
      setTimeout(() => {
        closeModal('recipe');
        dispatch({ type: 'SET_CURRENT_RECIPE', payload: { recipe: null, isEditing: false } });
      }, 1000);
    } catch (error) {
      setMessage({ text: `Failed to save recipe: ${error.message}`, type: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleClose = () => {
    closeModal('recipe');
    dispatch({ type: 'SET_CURRENT_RECIPE', payload: { recipe: null, isEditing: false } });
    setMessage({ text: '', type: '' });
  };

  return (
    <ModalBase isOpen={isModalOpen('recipe')} onClose={handleClose}>
      <h2>{isEditing ? 'Edit Recipe' : 'Add New Recipe'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="instructions">Instructions & Ingredients:</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="10"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="prep_time_minutes">Preparation Time (minutes):</label>
          <input
            type="number"
            name="prep_time_minutes"
            value={formData.prep_time_minutes}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cook_time_minutes">Cook Time (minutes):</label>
          <input
            type="number"
            name="cook_time_minutes"
            value={formData.cook_time_minutes}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="servings">Servings:</label>
          <input
            type="number"
            name="servings"
            value={formData.servings}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image_url">Image URL:</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cuisine_type">Cuisine Type:</label>
          <input
            type="text"
            name="cuisine_type"
            value={formData.cuisine_type}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="difficulty_level">Difficulty Level:</label>
          <select
            name="difficulty_level"
            value={formData.difficulty_level}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            name="is_public"
            checked={formData.is_public}
            onChange={handleChange}
          />
          <label htmlFor="is_public">Make Public</label>
        </div>
        
        <Button type="submit" className="btn-primary">Save Recipe</Button>
        {message.text && (
          <p className={`form-message ${message.type}`}>{message.text}</p>
        )}
      </form>
    </ModalBase>
  );
}

export default RecipeModal;