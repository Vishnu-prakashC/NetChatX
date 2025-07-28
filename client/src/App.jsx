import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'user', text: 'Hi! How can I help you today?', time: '10:00 AM' },
    { id: 2, sender: 'me', text: 'Tell me a joke!', time: '10:01 AM' },
    { id: 3, sender: 'user', text: 'Why don’t scientists trust atoms? Because they make up everything!', time: '10:01 AM' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    const newMsg = {
      id: messages.length + 1,
      sender: 'me',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow p-4 text-xl font-bold text-blue-600 text-center">
        Chat App
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-md px-4 py-2 rounded-lg shadow text-white ${
              msg.sender === 'me' ? 'bg-blue-600 self-end ml-auto' : 'bg-gray-500 self-start'
            }`}
          >
            <div>{msg.text}</div>
            <div className="text-sm opacity-70 mt-1 text-right">{msg.time}</div>
          </div>
        ))}
      </main>

      <footer className="p-4 bg-white shadow flex gap-2">
        <input
          className="flex-1 px-4 py-2 border rounded focus:outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSend}
        >
          Send
        </button>
      </footer>
    </div>
  );
}

export default App;
