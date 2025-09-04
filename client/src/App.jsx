import React, { useEffect, useState } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ChatMain from './components/ChatMain';
import LoginForm from './components/LoginForm';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  // Restore auth and selected chat on load
  useEffect(() => {
    const savedUserJson = localStorage.getItem('chat_current_user');
    if (savedUserJson) {
      try {
        const savedUser = JSON.parse(savedUserJson);
        if (savedUser && savedUser.email) {
          setCurrentUser(savedUser);
          setIsLoggedIn(true);
        }
      } catch {}
    }

    const savedSelectedChatJson = localStorage.getItem('chat_selected_chat');
    if (savedSelectedChatJson) {
      try {
        const savedChat = JSON.parse(savedSelectedChatJson);
        if (savedChat && (savedChat.name || savedChat.email || savedChat.id)) {
          setSelectedChat(savedChat);
        }
      } catch {}
    }
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
    try { localStorage.setItem('chat_current_user', JSON.stringify(userData)); } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setSelectedChat(null);
    try {
      localStorage.removeItem('chat_current_user');
      localStorage.removeItem('chat_selected_chat');
    } catch {}
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    try { localStorage.setItem('chat_selected_chat', JSON.stringify(chat)); } catch {}
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    
    <div className="app">
      <ChatSidebar 
        currentUser={currentUser}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        onLogout={handleLogout}
      />


      <ChatMain 
        selectedChat={selectedChat}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;
