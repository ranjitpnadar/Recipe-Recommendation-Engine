import React from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar/Sidebar';
import ChatMain from './components/Chat/ChatMain';
import LoginModal from './components/Modals/LoginModal';
import RegisterModal from './components/Modals/RegisterModal';
import ProfileModal from './components/Modals/ProfileModal';
import RecipeModal from './components/Modals/RecipeModal';
import RecipeDetailModal from './components/Modals/RecipeDetailModal';
import MyRecipesModal from './components/Modals/MyRecipesModal';
import './styles/App.css';

function App() {
  return (
    <AppProvider>
      <div className="app-container">
        <Sidebar />
        <ChatMain />
        
        {/* Modals */}
        <LoginModal />
        <RegisterModal />
        <ProfileModal />
        <RecipeModal />
        <RecipeDetailModal />
        <MyRecipesModal />
      </div>
    </AppProvider>
  );
}

export default App;