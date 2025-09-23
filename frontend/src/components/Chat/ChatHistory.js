import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

function ChatHistory() {
  const { state } = useAppContext();
  const { messages } = state.chat;
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const getFormatedRecipeDetails = (recipeData) => {
    let response = [];
    console.log(recipeData?.includes('data'))
    if(recipeData?.includes('data')){
        const parsedRecipeDetail = JSON.parse(recipeData);
        if(parsedRecipeDetail.data.hasOwnProperty('data')){
            response.push(`Recipe Name: ${parsedRecipeDetail.data.data.recipe_name}`)
            response.push(`Ingredients: ${parsedRecipeDetail.data.data.ingredients}`)
            response.push(`Instructions: ${parsedRecipeDetail.data.data.instructions}`)
            response.push(`Estimated Total Time: ${parsedRecipeDetail.data.data.estimated_total_time}`)
            response.push(`Chef Tip: ${parsedRecipeDetail.data.data.chef_tip}`)
            response.push(`Nutrition Information: ${parsedRecipeDetail.data.data.nutrition_information}`)
        }  
        return response.join("\n")
    }else{
        return recipeData;
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat-history">
        <div className="welcome-message">
          <h2>Welcome to your Recipe AI Assistant!</h2>
          <p>Ask me for recipe ideas, cooking tips, or anything food-related.</p>
          <p>Example: "Suggest a quick dinner recipe with chicken and broccoli."</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-history">
      {messages.map((message, index) => (
        <div key={index} className={`chat-message ${message.sender}`}>
          <div className="avatar">
            {message.sender === 'user' ? 'You' : 'AI'}
          </div>
          <div className="content">
            {getFormatedRecipeDetails(message.text)}
          </div>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
}

export default ChatHistory;