import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatSidebar from './components/ChatSidebar';
import ChatMain from './components/ChatMain';
import LoginForm from './components/LoginForm';
import AdminApp from './admin/AdminApp';
import './App.css';
import { clearAuth, setAuthToken } from './api';

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
    if (userData?.token) setAuthToken(userData.token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setSelectedChat(null);
    try {
      localStorage.removeItem('chat_current_user');
      localStorage.removeItem('chat_selected_chat');
    } catch {}
    clearAuth();
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    try { localStorage.setItem('chat_selected_chat', JSON.stringify(chat)); } catch {}
  };

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminApp />} />
      
      {/* Main Chat App */}
      <Route path="/*" element={
        !isLoggedIn ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
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
        )
      } />
    </Routes>
  );
}

export default App;
