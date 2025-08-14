import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import './Components.css';

const socket = io('http://localhost:5000'); // backend server

const ChatMain = ({ selectedChat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Join the selected chat room
  useEffect(() => {
    if (selectedChat) {
      socket.emit('joinRoom', selectedChat.id);
      setMessages([]); // Clear old messages
    }
  }, [selectedChat]);

  // Listen for incoming messages
  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const messageData = {
        roomId: selectedChat.id,
        sender: currentUser,
        text: newMessage.trim(),
        timestamp: Date.now()
      };
      socket.emit('sendMessage', messageData);
      setMessages((prev) => [...prev, { ...messageData, sender: 'You' }]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!selectedChat) {
    return (
      <div className="chat-main">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3>Welcome to Chat</h3>
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-main">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-avatar">{selectedChat.avatar}</div>
        <div className="chat-header-info">
          <h3>{selectedChat.name}</h3>
          <p>{selectedChat.online ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === 'You' ? 'own' : ''}`}>
            <div className="message-content">
              <div>{message.text}</div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="message-input-container">
        <textarea
          className="message-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows="1"
        />
        <button className="send-btn" onClick={handleSendMessage} disabled={!newMessage.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatMain;
