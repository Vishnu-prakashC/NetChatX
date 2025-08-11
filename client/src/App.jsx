import React, { useState } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ChatMain from './components/ChatMain';
import LoginForm from './components/LoginForm';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setSelectedChat(null);
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <ChatSidebar 
        currentUser={currentUser}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
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
