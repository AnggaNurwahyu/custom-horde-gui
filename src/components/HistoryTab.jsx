import React from 'react';

const HistoryTab = ({
  activeTab,
  history,
  setHistory,
  onSelectItem
}) => {
  if (activeTab !== 'history') return null;

  const handleWipeHistory = () => {
    if (window.confirm('Hapus seluruh riwayat generasi Anda secara permanen?')) {
      setHistory([]);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-down">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Riwayat Generasi (History)</h2>
            <p className="text-sm text-gray-500 mt-1">
              Seluruh hasil render otomatis tersimpan di sini secara lokal. Klik pada gambar untuk membedah detail metadata.
            </p>
          </div>
          {history.length > 0 && (
            <button 
              onClick={handleWipeHistory} 
              className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors"
            >
              Wipe History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">Belum Ada Riwayat Gambar</h3>
            <p className="text-sm text-gray-400 mt-1">Silakan lakukan generate gambar terlebih dahulu di tab Workspace.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onSelectItem(item)}
                className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-400 transition-all duration-300 cursor-pointer group relative"
              >
                <div className="aspect-square bg-gray-200 overflow-hidden relative">
                  <img src={item.image} alt="History thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-white font-bold bg-black/50 px-3 py-1.5 rounded-xl backdrop-blur-sm">Lihat Detail 🔍</span>
                  </div>
                </div>
                <div className="p-3 space-y-1 bg-white">
                  <p className="text-[10px] font-bold text-indigo-600 truncate">{item.model}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-snug">{item.prompt}</p>
                  <div className="flex justify-between items-center pt-1 text-[9px] text-gray-400 font-mono">
                    <span>Seed: {item.seed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HistoryTab;
