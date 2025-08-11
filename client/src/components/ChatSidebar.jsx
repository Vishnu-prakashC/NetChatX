import React, { useState } from 'react';

const ChatSidebar = ({ currentUser, selectedChat, onSelectChat, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample chat data
  const chats = [
    {
      id: 1,
      name: 'John Doe',
      avatar: 'JD',
      lastMessage: 'Hey! How are you doing?',
      time: '2 min ago',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      avatar: 'SW',
      lastMessage: 'Thanks for the help yesterday!',
      time: '1 hour ago',
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: 'Mike Johnson',
      avatar: 'MJ',
      lastMessage: 'Can we meet tomorrow?',
      time: '3 hours ago',
      unread: 1,
      online: true
    },
    {
      id: 4,
      name: 'Emma Davis',
      avatar: 'ED',
      lastMessage: 'The project is ready for review',
      time: '5 hours ago',
      unread: 0,
      online: false
    },
    {
      id: 5,
      name: 'Alex Thompson',
      avatar: 'AT',
      lastMessage: 'Great work on the presentation!',
      time: '1 day ago',
      unread: 0,
      online: true
    }
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar">
      {/* Header with user info */}
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            {currentUser?.avatar || 'U'}
          </div>
          <div className="user-details">
            <h3>{currentUser?.name || 'User'}</h3>
            <p>Online</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16,17 21,12 16,7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Chat list */}
      <div className="chats-list">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="chat-avatar">
              {chat.avatar}
              {chat.online && (
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  border: '2px solid white'
                }}></div>
              )}
            </div>
            <div className="chat-info">
              <div className="chat-name">{chat.name}</div>
              <div className="chat-last-message">{chat.lastMessage}</div>
            </div>
            <div className="chat-time">
              {chat.time}
              {chat.unread > 0 && (
                <div style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  marginTop: '4px'
                }}>
                  {chat.unread}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar; 