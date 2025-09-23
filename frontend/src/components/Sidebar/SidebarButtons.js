import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../hooks/useModal';
import Button from '../common/Button';

function SidebarButtons() {
  const { dispatch } = useAppContext();
  const { isAuthenticated, logout } = useAuth();
  const { openModal } = useModal();

  const handleNewChat = () => {
    dispatch({ type: 'CLEAR_CHAT' });
  };

  const handleLogout = () => {
    logout();
    alert('Logged out successfully!');
  };

  return (
    <>
      <div className="sidebar-header">
        <div className="logo">Recipe AI</div>
        <Button 
          onClick={handleNewChat}
          className="btn-primary btn-full-width"
          icon="fas fa-plus"
        >
          New Recipe
        </Button>
      </div>

      <div className="sidebar-footer">
        {isAuthenticated ? (
          <>
            <Button 
              onClick={() => openModal('recipe')}
              className="btn-success btn-full-width"
              icon="fas fa-utensils"
            >
              Add New Recipe
            </Button>
            <Button 
              onClick={() => openModal('myRecipes')}
              className="btn-info btn-full-width"
              icon="fas fa-list"
            >
              View My Recipes
            </Button>
            <hr />
            <Button 
              onClick={() => openModal('profile')}
              className="btn-secondary btn-full-width"
              icon="fas fa-user-circle"
            >
              Profile
            </Button>
            <Button 
              onClick={handleLogout}
              className="btn-danger btn-full-width"
              icon="fas fa-sign-out-alt"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={() => openModal('login')}
              className="btn-secondary btn-full-width"
              icon="fas fa-sign-in-alt"
            >
              Login
            </Button>
            <Button 
              onClick={() => openModal('register')}
              className="btn-secondary btn-full-width"
              icon="fas fa-user-plus"
            >
              Register
            </Button>
          </>
        )}
      </div>
    </>
  );
}

export default SidebarButtons;