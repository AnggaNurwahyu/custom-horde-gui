import React, { useState } from 'react';

const LoraCard = ({ lora, onSelect }) => {
  const [selectedVersion, setSelectedVersion] = useState(lora.modelVersions?.[0]?.id || '');
  
  const activeVersion = lora.modelVersions?.find(v => v.id.toString() === selectedVersion.toString()) || lora.modelVersions?.[0];
  const imageUrl = activeVersion?.images?.[0]?.url || 'https://via.placeholder.com/300x400?text=No+Preview';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
        <img src={imageUrl} alt={lora.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <button 
            onClick={() => onSelect(lora, selectedVersion)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            Gunakan Versi Ini
          </button>
        </div>

        <a 
          href={`https://civitai.com/models/${lora.id}`} target="_blank" rel="noopener noreferrer"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-colors z-10"
          title="Lihat halaman asli di Civitai"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight" title={lora.name}>{lora.name}</h3>
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Versi LoRA</label>
          <select 
            value={selectedVersion} 
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50 truncate cursor-pointer transition-shadow hover:shadow-sm"
          >
            {lora.modelVersions?.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1.5 rounded-md font-mono font-bold border border-indigo-100">
            ID: {selectedVersion || lora.id}
          </span>
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
            {lora.stats?.favoriteCount > 999 ? (lora.stats.favoriteCount/1000).toFixed(1) + 'k' : (lora.stats?.favoriteCount || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoraCard;
