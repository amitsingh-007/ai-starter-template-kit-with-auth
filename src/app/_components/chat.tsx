import React from 'react';

const Chat = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left side: Input box */}
      <div className="w-1/2 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">AI Input</h1>
        <textarea
          className="flex-grow bg-gray-800 border border-gray-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your prompt here..."
        ></textarea>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Send
        </button>
      </div>

      {/* Right side: AI response */}
      <div className="w-1/2 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">AI Response</h1>
        <div className="flex-grow bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-y-auto">
          {/* Streaming response will be displayed here */}
          <p className="text-gray-400">Waiting for response...</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
