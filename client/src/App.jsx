function App() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col p-4">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">Chatly</h1>

        <button className="bg-blue-600 text-white py-2 rounded-lg mb-4 hover:bg-blue-700 transition-all">
          + New Chat
        </button>

        <div className="flex-1 space-y-3 overflow-auto">
          {['Alice', 'Bob', 'Charlie'].map((user, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-100 rounded-lg hover:bg-blue-100 transition cursor-pointer"
            >
              <p className="font-medium">{user}</p>
              <p className="text-sm text-gray-500 truncate">Last message preview here...</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t mt-4 text-sm text-gray-500">
          Logged in as <span className="font-semibold">vichu</span>
        </div>
      </aside>

      {/* Main Chat Section */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <header className="px-6 py-4 border-b bg-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Alice</h2>
            <p className="text-sm text-green-500">Online</p>
          </div>
          <div className="space-x-3 text-gray-600">
            <button title="Search">🔍</button>
            <button title="Settings">⚙️</button>
          </div>
        </header>

        {/* Messages */}
        <section className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex">
            <div className="bg-white p-3 rounded-xl shadow max-w-sm">
              Hello! 👋
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white p-3 rounded-xl shadow max-w-sm">
              Hey! How are you?
            </div>
          </div>
          <div className="flex">
            <div className="bg-white p-3 rounded-xl shadow max-w-sm">
              Doing great! Working on our chat app 😄
            </div>
          </div>
        </section>

        {/* Input Area */}
        <footer className="px-6 py-4 bg-white border-t flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
            Send
          </button>
        </footer>
      </main>
    </div>
  );
}

export default App;
