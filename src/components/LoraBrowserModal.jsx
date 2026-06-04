import React from 'react';
import LoraCard from './LoraCard';

const LoraBrowserModal = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  baseModelFilter,
  setBaseModelFilter,
  searchResults,
  isSearching,
  onSearch,
  onSelectLora
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 animate-fade-in-down">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
        
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            Browser LoRA Civitai
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              onSearch(searchQuery, baseModelFilter); 
            }} 
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Cari LoRA..." 
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm shadow-sm"
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              value={baseModelFilter}
              onChange={(e) => setBaseModelFilter(e.target.value)}
              className="w-48 py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-sm font-semibold text-gray-700 shadow-sm cursor-pointer"
            >
              <option value="">Semua Base Model</option>
              <option value="SD 1.5">SD 1.5</option>
              <option value="SDXL 1.0">SDXL 1.0</option>
              <option value="Pony">Pony</option>
              <option value="Illustrious">Illustrious</option>
            </select>

            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
            >
              Cari
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-100/50">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-bold animate-pulse">Menghubungi Server Civitai...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Tidak ada hasil</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchResults.map((lora) => (
                <LoraCard 
                  key={lora.id} 
                  lora={lora} 
                  onSelect={onSelectLora} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoraBrowserModal;
