import React from 'react';
import ToggleSwitch from './ToggleSwitch';

const SidebarSettings = ({
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel,
  models,
  isLoadingData,
  selectedWorker,
  setSelectedWorker,
  workersList,
  resolution,
  setResolution,
  batchSize,
  setBatchSize,
  openLoraBrowser,
  handleAddLoraManual,
  loras,
  handleRemoveLora,
  handleUpdateLora,
  sampler,
  setSampler,
  steps,
  setSteps,
  cfgScale,
  setCfgScale,
  clipSkip,
  setClipSkip,
  seed,
  setSeed,
  useTrustedWorkers,
  setUseTrustedWorkers,
  useKarras,
  setUseKarras,
  allowSlowWorkers,
  setAllowSlowWorkers,
  useHiresFix,
  setUseHiresFix,
  useTiling,
  setUseTiling
}) => {
  return (
    <div className="lg:col-span-4 space-y-5">
      {/* Horde API Key Panel */}
      <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Horde API Key (Tersimpan Lokal)</label>
        <input
          type="password"
          placeholder="Masukkan API Key (Opsional)"
          className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-gray-50"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      {/* Main Settings Panel */}
      <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 border-b pb-2">Pengaturan Utama</h2>
        <div>
          <label className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <span>Model AI Aktif</span>
            {isLoadingData && <span className="text-blue-500">Memuat...</span>}
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isLoadingData}
            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:opacity-50"
          >
            {models.map((model) => (
              <option key={model.name} value={model.name}>{model.name} ({model.count} workers)</option>
            ))}
          </select>
        </div>

        {/* TARGET WORKER (DATALIST) AGAR BISA KETIK WORKER PRIVAT */}
        <div>
          <label className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <span>Target Worker (Opsional)</span>
          </label>
          <input
            type="text"
            list="horde-workers"
            placeholder="Auto, atau Ketik UUID Worker Anda"
            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono"
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
          />
          <datalist id="horde-workers">
            {workersList.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resolusi</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="1024x1024">1024 x 1024 (SDXL Square)</option>
              <option value="832x1216">832 x 1216 (SDXL Portrait)</option>
              <option value="1216x832">1216 x 832 (SDXL Landscape)</option>
              <option value="512x768">512 x 768 (SD1.5 Portrait)</option>
              <option value="768x512">768 x 512 (SD1.5 Landscape)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jumlah Gambar</label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 bg-indigo-50"
            >
              <option value="1">1 Gambar</option>
              <option value="2">2 Gambar (Batch)</option>
              <option value="3">3 Gambar (Batch)</option>
              <option value="4">4 Gambar (Batch)</option>
            </select>
          </div>
        </div>
      </div>

      {/* PANEL MANAJEMEN LORA */}
      <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-3 border-b pb-2">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Manajemen LoRA</h2>
          <div className="flex gap-2">
            <button 
              onClick={openLoraBrowser} 
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              Browser
            </button>
            <button 
              onClick={handleAddLoraManual} 
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              + Manual
            </button>
          </div>
        </div>
        
        {loras.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-2">Belum ada LoRA yang aktif.</p>
        ) : (
          <div className="space-y-4">
            {loras.map(lora => (
              <div key={lora.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3 relative group transition-all">
                <button 
                  onClick={() => handleRemoveLora(lora.id)} 
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors" 
                  title="Hapus LoRA ini"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="pr-6">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 line-clamp-1">
                    {lora.title ? lora.title : "Civitai ID"}
                  </label>
                  <input 
                    type="text" 
                    value={lora.name} 
                    onChange={(e) => handleUpdateLora(lora.id, 'name', e.target.value)} 
                    placeholder="ID Civitai" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white font-mono" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Strength</label>
                    <span className="font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[10px]">{lora.strength}</span>
                  </div>
                  <input 
                    type="range" 
                    min="-2" 
                    max="2" 
                    step="0.05" 
                    value={lora.strength} 
                    onChange={(e) => handleUpdateLora(lora.id, 'strength', e.target.value)} 
                    className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KSampler & Tuning Panel */}
      <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 border-b pb-2">KSampler & Tuning</h2>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sampling Method</label>
          <select 
            value={sampler} 
            onChange={(e) => setSampler(e.target.value)} 
            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
          >
            <option value="k_euler_a">Euler a</option>
            <option value="k_dpmpp_2m">DPM++ 2M</option>
            <option value="k_dpmpp_sde">DPM++ SDE</option>
            <option value="dpmsolver">DPM Solver</option>
            <option value="k_dpm_2_a">DPM2 a</option>
          </select>
        </div>
        <div className="pt-2">
          <div className="flex justify-between text-sm mb-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sampling Steps</label>
            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">{steps}</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="50" 
            value={steps} 
            onChange={(e) => setSteps(Number(e.target.value))} 
            className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
          />
        </div>
        <div className="pt-2">
          <div className="flex justify-between text-sm mb-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CFG Scale</label>
            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">{cfgScale}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="15" 
            step="0.5" 
            value={cfgScale} 
            onChange={(e) => setCfgScale(Number(e.target.value))} 
            className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
          />
        </div>
        <div className="pt-2">
          <div className="flex justify-between text-sm mb-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clip Skip</label>
            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">{clipSkip}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="12" 
            step="1" 
            value={clipSkip} 
            onChange={(e) => setClipSkip(Number(e.target.value))} 
            className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
          />
        </div>
        <div className="pt-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seed</label>
          <input 
            type="text" 
            placeholder="Kosongkan untuk acak setiap generate" 
            value={seed} 
            onChange={(e) => setSeed(e.target.value)} 
            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono" 
          />
        </div>
      </div>

      {/* Parameter Tambahan Panel */}
      <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm space-y-1">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 border-b pb-2">Parameter Tambahan</h2>
        <ToggleSwitch 
          label="Trusted Workers Only" 
          description="Hanya gunakan worker terverifikasi." 
          checked={useTrustedWorkers} 
          onChange={setUseTrustedWorkers} 
        />
        <ToggleSwitch 
          label="Karras Schedule" 
          description="Kurangi noise pada langkah sampler." 
          checked={useKarras} 
          onChange={setUseKarras} 
        />
        <ToggleSwitch 
          label="Allow Slow Workers" 
          description="Matikan untuk abaikan GPU lambat." 
          checked={allowSlowWorkers} 
          onChange={setAllowSlowWorkers} 
        />
        <ToggleSwitch 
          label="Hires Fix" 
          description="Upscale & perbaiki detail gambar." 
          checked={useHiresFix} 
          onChange={setUseHiresFix} 
        />
        <ToggleSwitch 
          label="Tiling" 
          description="Hasilkan pola tekstur menyambung." 
          checked={useTiling} 
          onChange={setUseTiling} 
        />
      </div>
    </div>
  );
};

export default SidebarSettings;
