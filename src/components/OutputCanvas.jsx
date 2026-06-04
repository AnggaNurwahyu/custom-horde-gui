import React from 'react';

const OutputCanvas = ({
  generatedImages,
  isGenerating,
  genProgress,
  error
}) => {
  return (
    <div className="bg-white p-2 border border-gray-200 rounded-2xl shadow-sm min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">

      {generatedImages.length === 0 && !isGenerating && !error && (
        <div className="text-center text-gray-400 flex flex-col items-center p-8">
          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-medium text-gray-500">Kanvas Output Gambar</p>
          <p className="text-sm mt-1">Gambar hasil render akan muncul di sini dan langsung dicatat ke History.</p>
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center space-y-6 px-8 py-10 text-center z-10 bg-white/90 rounded-3xl backdrop-blur-md shadow-2xl border border-indigo-100 max-w-sm w-full animate-fade-in-down">
          
          {/* Lingkaran Status Dinamis */}
          <div className="relative w-24 h-24">
            {genProgress.status === 'downloading' ? (
              <div className="w-full h-full border-4 border-green-500 border-t-green-200 rounded-full animate-spin"></div>
            ) : (
              <div className={`w-full h-full border-4 rounded-full animate-spin ${genProgress.status === 'rendering' ? 'border-indigo-200 border-t-indigo-600' : 'border-amber-200 border-t-amber-500'}`}></div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center text-3xl">
              {genProgress.status === 'rendering' ? '🎨' : genProgress.status === 'downloading' ? '📦' : '⏳'}
            </div>
          </div>
          
          {/* Teks Status */}
          <div className="w-full space-y-3">
            <p className="text-lg font-bold text-gray-800">
              {genProgress.status === 'rendering' ? 'GPU Sedang Merender...' 
               : genProgress.status === 'downloading' ? 'Mengunduh Hasil Akhir...'
               : 'Menunggu Antrean Jaringan...'}
            </p>
            
            {/* Metrik Data */}
            {genProgress.status !== 'downloading' && (
              <div className="space-y-2">
                {genProgress.status === 'waiting' && genProgress.queue > 0 && (
                  <div className="flex justify-between items-center bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Posisi Antrean</span>
                    <span className="text-lg font-black text-amber-600">{genProgress.queue}</span>
                  </div>
                )}
                
                {genProgress.waitTime > 0 && (
                  <div className="flex justify-between items-center bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Estimasi Waktu</span>
                    <span className="text-lg font-black text-indigo-600">{genProgress.waitTime} <span className="text-xs">detik</span></span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 font-medium">
            {genProgress.status === 'rendering' 
              ? 'Harap tunggu. Worker sedang mengeksekusi parameter dan model yang Anda minta.' 
              : genProgress.status === 'downloading'
              ? 'Menyimpan ke History Lokal...'
              : 'Mencari GPU publik yang tersedia untuk mengeksekusi request Anda.'}
          </p>
        </div>
      )}

      {!isGenerating && generatedImages.length > 0 && (
        <div className={`w-full h-full p-2 grid gap-4 ${generatedImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} auto-rows-max`}>
          {generatedImages.map((imgUrl, idx) => (
            <div key={idx} className="relative flex flex-col items-center bg-gray-200 rounded-xl overflow-hidden shadow-inner border border-gray-300/40">
              <img src={imgUrl} alt={`AI Generated ${idx + 1}`} className="w-full h-full object-contain max-h-[75vh]" />
            </div>
          ))}
        </div>
      )}

      {!isGenerating && error && (
        <div className="p-6 text-center space-y-3 bg-red-50 rounded-xl border border-red-100 m-4">
          <span className="text-4xl block">⚠️</span>
          <p className="text-base font-bold text-red-700">Proses Gagal</p>
          <p className="text-sm text-red-500 max-w-md">{error}</p>
        </div>
      )}
    </div>
  );
};

export default OutputCanvas;
