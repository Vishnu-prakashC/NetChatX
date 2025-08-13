import React, { useState, useRef, useEffect } from 'react';
import './Components.css';

const ChatMain = ({ selectedChat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Sample messages for each chat
  const sampleMessages = {
    1: [
      { id: 1, text: 'Hey vichu!', sender: 'tharu', timestamp: Date.now() - 60000 },
      { id: 2, text: 'hii', sender: 'You', timestamp: Date.now() - 45000 },
    //  { id: 3, text: 'Pretty good! Working on some new projects.', sender: 'John Doe', timestamp: Date.now() - 30000 },
     // { id: 4, text: 'That sounds exciting! What kind of projects?', sender: 'You', timestamp: Date.now() - 15000 }
    ],
    2: [
      { id: 1, text: 'hii ', sender: 'shiva', timestamp: Date.now() - 3600000 },
      { id: 2, text: 'enna pandra', sender: 'You', timestamp: Date.now() - 3500000 },
      { id: 3, text: '...', sender: 'shiva', timestamp: Date.now() - 3400000 }
    ],

  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(sampleMessages[selectedChat.id] || []);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const message = {
        id: Date.now(),
        text: newMessage.trim(),
        sender: 'You',
        timestamp: Date.now()
      };
      setMessages([...messages, message]);
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
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
        <div className="chat-header-avatar">
          {selectedChat.avatar}
        </div>
        <div className="chat-header-info">
          <h3>{selectedChat.name}</h3>
          <p>{selectedChat.online ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'You' ? 'own' : ''}`}
          >
            <div className="message-content">
              <div>{message.text}</div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <textarea
          className="message-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows="1"
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
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