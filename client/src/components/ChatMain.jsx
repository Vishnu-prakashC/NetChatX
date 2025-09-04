
import React, { useState, useRef, useEffect } from 'react';
import socket from '../socket';
import './Components.css';

// using shared singleton socket from ../socket

const ChatMain = ({ selectedChat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      const roomId = selectedChat?.name || selectedChat?.email || selectedChat?.id;
      fetch(`http://localhost:5000/api/messages/${roomId}`)
        .then((res) => res.json())
        .then((data) => { console.log('Fetched history:', data); setMessages(Array.isArray(data) ? data : []); })
        .catch((err) => console.error('Error fetching history:', err));

      socket.emit('joinRoom', roomId);
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on('message', (message) => {
      if (Array.isArray(message)) {
        setMessages(message);
      } else {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for others typing in the same room
  useEffect(() => {
    const handleUserTyping = (data) => {
      const currentRoomId = selectedChat?.name || selectedChat?.email || selectedChat?.id;
      if (data?.roomId === currentRoomId && data?.user && data?.user !== currentUser?.name) {
        setTypingUser(data.user);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
      }
    };

    socket.on('user_typing', handleUserTyping);
    return () => {
      socket.off('user_typing', handleUserTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedChat, currentUser?.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!selectedChat) return;
    const roomId = selectedChat?.name || selectedChat?.email || selectedChat?.id;
    const userName = currentUser?.name || currentUser?.email || 'Someone';
    socket.emit('typing', { roomId, user: userName });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const senderString = currentUser?.email || currentUser?.name || 'anonymous';

      const messageData = {
        roomId: selectedChat?.name || selectedChat?.email || selectedChat?.id,
        sender: senderString,
        text: newMessage.trim(),
        timestamp: Date.now(),
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
    if (!timestamp) return '';
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
      <div className="chat-header">
        <div className="chat-header-avatar">{selectedChat.avatar}</div>
        <div className="chat-header-info">
          <h3>{selectedChat.name}</h3>
          <p>{selectedChat.online ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {typingUser && (
        <div className="typing-indicator">{typingUser} is typing...</div>
      )}

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'You' ? 'own' : ''}`}
          >
            <div className="message-content">
              <div>{message.text}</div>
              <div className="message-time">{formatTime(message.timestamp || message.createdAt)}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <textarea
          className="message-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
          onKeyPress={handleKeyPress}
          rows="1"
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatMain;
