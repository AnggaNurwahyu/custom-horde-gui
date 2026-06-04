import React from 'react';

const PromptSection = ({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  onGenerate,
  onClear,
  isGenerating,
  isLoadingData,
  batchSize
}) => {
  return (
    <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Prompt Positif</label>
        <textarea
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all shadow-inner text-sm resize-y min-h-[120px]"
          placeholder="Gambarkan visi Anda secara detail di sini..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Prompt Negatif</label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 transition-all shadow-inner text-sm bg-red-50/30 resize-y min-h-[80px]"
          placeholder="Apa yang ingin Anda hindari (misal: cacat, kualitas rendah)..."
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
        />
      </div>

      <div className="flex gap-4 pt-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim() || isLoadingData}
          className={`flex-1 font-semibold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center text-sm ${
            isGenerating || !prompt.trim() || isLoadingData
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Memproses...
            </span>
          ) : (
            `Generate ${batchSize > 1 ? batchSize + ' Gambar' : 'Gambar'}`
          )}
        </button>

        <button 
          onClick={onClear} 
          className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-5 rounded-xl transition-all active:scale-95 border border-gray-300 shadow-sm flex items-center justify-center"
        >
          Clear Text
        </button>
      </div>
    </div>
  );
};

export default PromptSection;
