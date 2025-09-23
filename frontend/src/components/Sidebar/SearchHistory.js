import React from 'react';
import { useAppContext } from '../../context/AppContext';

function SearchHistory() {
  const { state, dispatch } = useAppContext();
  const { searchHistory } = state.chat;

  const handleHistoryClick = (query) => {
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { sender: 'user', text: query }
    });
    // You might want to trigger the search here as well
  };

  return (
    <div className="sidebar-content">
      <h3>Search History</h3>
      <ul id="searchHistoryList">
        {searchHistory.length === 0 ? (
          <li>No recent searches.</li>
        ) : (
          searchHistory.map((query, index) => (
            <li key={index}>
              <button onClick={() => handleHistoryClick(query)}>
                {query}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default SearchHistory;