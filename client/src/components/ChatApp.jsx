import React from "react";

const ChatApp = () => {
    return (
        <div className="flex h-screen font-sans">
            {/* Sidebar */}
            <div className="w-1/4 bg-gradient-to-b from-blue-600 to-indigo-700 text-white p-4 shadow-md">
                <h2 className="text-2xl font-bold mb-6">Chats</h2>
                <ul className="space-y-3">
                    <li className="hover:bg-indigo-500 p-2 rounded-md cursor-pointer">User 1</li>
                    <li className="hover:bg-indigo-500 p-2 rounded-md cursor-pointer">User 2</li>
                </ul>
            </div>

            {/* Main Chat Area */}
            <div className="w-3/4 flex flex-col bg-gray-100 relative">
                {/* Header */}
                <div className="bg-white shadow p-4 border-b text-center text-lg font-semibold">
                    Welcome to Chat
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Sample messages */}
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
        </div>
    );
};

export default ChatApp;
