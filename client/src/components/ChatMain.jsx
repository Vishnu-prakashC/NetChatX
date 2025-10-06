import React, { useState, useRef, useEffect, useMemo } from 'react';
import socket from '../socket';
import { sendRoomMessage } from '../api';
import './Components.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// using shared singleton socket from ../socket

const ChatMain = ({ selectedChat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const activeRoomId = useMemo(() => {
    if (!selectedChat) return null;
    return selectedChat.name || selectedChat.email || selectedChat.id || null;
  }, [selectedChat]);

  useEffect(() => {
    if (!activeRoomId || !currentUser?.name) return;

    let isMounted = true;
    const token = localStorage.getItem('token');

    axios
      .get(`${API_URL}/api/messages/${activeRoomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (isMounted) setMessages(res.data);
      })
      .catch(() => {
        if (isMounted) setMessages([]);
      });

    socket.connect();
    socket.emit('joinRoom', { roomId: activeRoomId });

    const handleReceiveMessage = (msg) => {
      if (!isMounted) return;
      if (Array.isArray(msg)) {
        setMessages(msg);
      } else {
        setMessages(prevMessages => [...prevMessages, msg]);
      }
    };

    const handleUserTyping = ({ sender }) => {
      if (sender && sender !== currentUser.name) {
        setTypingUser(sender);
        setTimeout(() => setTypingUser(''), 1500);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      isMounted = false;
      socket.emit('leaveRoom', { roomId: activeRoomId });
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [activeRoomId, currentUser?.name]);

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
    if (!activeRoomId || !currentUser?.name) return;
    socket.emit('typing', { roomId: activeRoomId, sender: currentUser.name });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const senderString = currentUser?.email || currentUser?.name || 'anonymous';

      const roomId = selectedChat?.name || selectedChat?.email || selectedChat?.id;
      const text = newMessage.trim();
      // Fire-and-forget to REST for persistence, socket will broadcast
      sendRoomMessage(roomId, { text }).catch(() => {});
      socket.emit('sendMessage', { roomId, text });
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

  if (!activeRoomId || !currentUser) {
    return (
      <div className="chat-main">
        <div className="empty-state">
          <h3>Preparing chat…</h3>
          <p>Please select a conversation or log in again.</p>
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
