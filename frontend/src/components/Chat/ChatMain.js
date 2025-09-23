import React from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

function ChatMain() {
  return (
    <main className="chat-main">
      <ChatHistory />
      <ChatInput />
    </main>
  );
}

export default ChatMain;