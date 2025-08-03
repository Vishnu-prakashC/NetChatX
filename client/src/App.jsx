import React from 'react';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import ChatApp from './components/ChatApp';

function App() {
  return (
 <div className="h-screen flex">
  <Sidebar />      // Left side: User list or navigation
  <ChatApp />      // Possibly for routing, logic, or chat context
  <ChatWindow />   // Main chat area
</div>
  );
}

export default App;
