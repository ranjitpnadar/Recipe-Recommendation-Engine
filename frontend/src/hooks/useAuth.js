import { useAppContext } from '../context/AppContext';

export function useAuth() {
  const { state, dispatch } = useAppContext();

  const login = (token, userId, profile = null) => {
    localStorage.setItem('recipe_book_jwt_token', token);
    localStorage.setItem('current_user_id', userId);
    
    dispatch({
      type: 'SET_AUTH',
      payload: {
        isAuthenticated: true,
        token,
        userId,
        profile
      }
    });
  };

  const logout = () => {
    localStorage.removeItem('recipe_book_jwt_token');
    localStorage.removeItem('current_user_id');
    
    dispatch({
      type: 'SET_AUTH',
      payload: {
        isAuthenticated: false,
        token: '',
        userId: '',
        profile: null
      }
    });
    
    dispatch({ type: 'CLEAR_CHAT' });
  };

  const updateProfile = (profile) => {
    dispatch({
      type: 'SET_AUTH',
      payload: {
        ...state.user,
        profile
      }
    });
  };

  return {
    isAuthenticated: state.user.isAuthenticated,
    token: state.user.token,
    userId: state.user.userId,
    profile: state.user.profile,
    login,
    logout,
    updateProfile
  };
}

// Default export
export default useAuth;