import React from 'react';

const Header = ({ activeTab, setActiveTab, historyLength, hordeStats }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            AI Gen <span className="text-blue-600">Biji</span>
          </h1>
          <nav className="hidden sm:flex space-x-1">
            <button 
              onClick={() => setActiveTab('generate')} 
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'generate' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Generator
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              History ({historyLength})
            </button>
          </nav>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="hidden md:flex items-center space-x-2 text-gray-600">
            <span className="font-semibold text-blue-600">{hordeStats.workers}</span> Workers
          </div>
          <div className="hidden md:flex items-center space-x-2 text-gray-600">
            <span className="font-semibold text-amber-600">{hordeStats.queued}</span> Antrean
          </div>
          <div className="flex items-center space-x-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-green-700 hidden sm:inline">Online</span>
          </div>
        </div>
      </div>
      <div className="sm:hidden flex border-t border-gray-100">
        <button 
          onClick={() => setActiveTab('generate')} 
          className={`flex-1 py-3 text-sm font-semibold ${
            activeTab === 'generate' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          Generator
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`flex-1 py-3 text-sm font-semibold ${
            activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          History ({historyLength})
        </button>
      </div>
    </header>
  );
};

export default Header;
