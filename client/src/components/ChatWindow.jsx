import React from 'react';

const ChatWindow = () => {
  return (
    <div className="w-3/4 flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow p-4 border-b text-lg font-semibold">
        Chat with User
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="self-start bg-white px-4 py-2 rounded-lg shadow w-fit">
          Hello!
        </div>
        <div className="self-end bg-blue-500 text-white px-4 py-2 rounded-lg shadow w-fit">
          Hi, how are you?
        </div>
      </div>

      {/* Input */}
      <div className="flex p-4 bg-white border-t">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg outline-none"
        />
        <button className="ml-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
