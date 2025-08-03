import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-1/4 bg-indigo-700 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Chats</h2>
      <ul className="space-y-3">
        <li className="hover:bg-indigo-500 p-2 rounded-md cursor-pointer">User 1</li>
        <li className="hover:bg-indigo-500 p-2 rounded-md cursor-pointer">User 2</li>
      </ul>
    </div>
  );
};

export default Sidebar;
