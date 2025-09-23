import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

function ChatInput() {
  const [input, setInput] = useState('');
  const { dispatch } = useAppContext();
  const { makeApiRequest } = useApi();
  const { isAuthenticated } = useAuth();

  const handleSend = async () => {
    const query = input.trim();
    if (!query) return;

    // Add user message
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { sender: 'user', text: query }
    });

    // Add to search history
    dispatch({
      type: 'ADD_SEARCH_HISTORY',
      payload: query
    });

    setInput('');

    try {
      const aiResponse = await makeApiRequest('POST', '/recipes/search-llm', { query }, true);
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: { sender: 'ai', text: JSON.stringify(aiResponse, null, 2) }
      });
    } catch (error) {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: { 
          sender: 'ai', 
          text: `Error: ${error.message}. Please ensure you are logged in and the API is running.` 
        }
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-area">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Message Recipe AI..."
        rows="1"
        style={{ 
          height: 'auto',
          minHeight: '40px',
          maxHeight: '200px'
        }}
      />
      <Button 
        onClick={handleSend}
        className="btn-primary"
        icon="fas fa-paper-plane"
      />
    </div>
  );
}

export default ChatInput;