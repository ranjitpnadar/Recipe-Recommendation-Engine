import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  user: {
    isAuthenticated: false,
    token: localStorage.getItem('recipe_book_jwt_token') || '',
    userId: localStorage.getItem('current_user_id') || '',
    profile: null
  },
  chat: {
    messages: [],
    searchHistory: JSON.parse(localStorage.getItem('search_history')) || []
  },
  modals: {
    login: false,
    register: false,
    profile: false,
    recipe: false,
    recipeDetail: false,
    myRecipes: false
  },
  recipes: {
    list: [],
    currentRecipe: null,
    isEditing: false
  },
  api: {
    baseUrl: 'http://localhost:3000/api'
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        user: {
          ...state.user,
          isAuthenticated: action.payload.isAuthenticated,
          token: action.payload.token || '',
          userId: action.payload.userId || '',
          profile: action.payload.profile || null
        }
      };
    
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: [...state.chat.messages, action.payload]
        }
      };
    
    case 'CLEAR_CHAT':
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: []
        }
      };
    
    case 'ADD_SEARCH_HISTORY':
      const newHistory = [action.payload, ...state.chat.searchHistory].slice(0, 10);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
      return {
        ...state,
        chat: {
          ...state.chat,
          searchHistory: newHistory
        }
      };
    
    case 'SET_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modal]: action.payload.isOpen
        }
      };
    
    case 'SET_RECIPES':
      return {
        ...state,
        recipes: {
          ...state.recipes,
          list: action.payload
        }
      };
    
    case 'SET_CURRENT_RECIPE':
      return {
        ...state,
        recipes: {
          ...state.recipes,
          currentRecipe: action.payload.recipe,
          isEditing: action.payload.isEditing || false
        }
      };
    
    case 'SET_BASE_URL':
      return {
        ...state,
        api: {
          ...state.api,
          baseUrl: action.payload
        }
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Check if user is authenticated on app load
    if (state.user.token && state.user.userId) {
      dispatch({
        type: 'SET_AUTH',
        payload: {
          isAuthenticated: true,
          token: state.user.token,
          userId: state.user.userId
        }
      });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Default export
export default AppContext;