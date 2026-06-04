import React from 'react';

const HistoryDetailModal = ({
  item,
  onClose,
  onDelete,
  onLoadParameters
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 animate-fade-in-down">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row shadow-2xl overflow-hidden border border-gray-200">
        
        <div className="flex-1 bg-gray-900 flex items-center justify-center p-4 relative group">
          <img src={item.image} alt="Detail view" className="max-w-full max-h-full object-contain rounded-xl" />
          <button 
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
            className="absolute bottom-4 left-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Hapus dari Riwayat
          </button>
        </div>

        <div className="w-full md:w-[450px] border-t md:border-t-0 md:border-l border-gray-200 flex flex-col bg-white h-full">
          
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Metadata Info</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.date}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-200/60 p-1.5 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Model AI Yang Digunakan</label>
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800 font-semibold">{item.model}</div>
            </div>

            {/* TAMPILAN TARGET WORKER DI HISTORY */}
            {item.worker && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Worker Pengeksekusi</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-600 text-[10px]">{item.worker}</div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Positive Prompt</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-700 max-h-36 overflow-y-auto select-all cursor-text whitespace-pre-wrap">{item.prompt}</div>
            </div>

            {item.negativePrompt && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Negative Prompt</label>
                <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl font-mono text-gray-600 max-h-24 overflow-y-auto select-all cursor-text whitespace-pre-wrap">{item.negativePrompt}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Sampler</span>
                <span className="font-mono font-bold text-gray-700 text-sm">{item.sampler}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Seed Sejati</span>
                <span className="font-mono font-bold text-indigo-700 text-sm select-all">{item.seed}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Steps</span>
                <span className="font-mono font-bold text-gray-700 text-sm">{item.steps}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">CFG Scale</span>
                <span className="font-mono font-bold text-gray-700 text-sm">{item.cfgScale}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Resolusi</span>
                <span className="font-mono font-bold text-gray-700 text-sm">{item.resolution}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Clip Skip</span>
                <span className="font-mono font-bold text-gray-700 text-sm">{item.clipSkip}</span>
              </div>
            </div>

            {item.loras && item.loras.length > 0 && (
              <div className="pt-3 border-t border-gray-100 space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tumpukan LoRA Yang Terkunci</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {item.loras.map((l, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg font-mono text-[11px]">
                      <span className="text-gray-700 font-bold truncate pr-2">{l.title || `Civitai ID: ${l.name}`}</span>
                      <span className="bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded text-[10px]">w: {l.strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button 
              onClick={() => onLoadParameters(item)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 text-xs flex justify-center items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Kembalikan ke Panel Kerja (Load Params)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HistoryDetailModal;
