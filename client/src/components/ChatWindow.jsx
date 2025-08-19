import React, { useState } from "react";
import "./Components.css";

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  if (!selectedChat) {
    return <div className="chat-window">Select a chat to start messaging</div>;
  }

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const msg = {
      id: Date.now(),
      sender: "You",
      text: newMessage,
      time: "Just now",
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{selectedChat.name}</h3>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <strong>{msg.sender}: </strong>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
