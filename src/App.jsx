import React, { useState, useEffect } from 'react';

// --- CUSTOM HOOK UNTUK LOCAL STORAGE ---
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error setting localStorage", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

// --- KOMPONEN KARTU LORA PINTAR (SMART LORA CARD) ---
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
// ----------------------------------------------------

const WebUI = () => {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' atau 'history'

  // State Input Utama
  const [prompt, setPrompt] = useLocalStorage('horde_prompt', '');
  const [negativePrompt, setNegativePrompt] = useLocalStorage('horde_neg_prompt', '');
  const [apiKey, setApiKey] = useLocalStorage('horde_api_key', '');

  // State Pengaturan Utama
  const [selectedModel, setSelectedModel] = useLocalStorage('horde_model', '');
  const [resolution, setResolution] = useLocalStorage('horde_resolution', '1024x1024');
  const [batchSize, setBatchSize] = useLocalStorage('horde_batch_size', 1);

  // State KSampler & Tuning
  const [sampler, setSampler] = useLocalStorage('horde_sampler', 'k_dpmpp_2m');
  const [steps, setSteps] = useLocalStorage('horde_steps', 25);
  const [cfgScale, setCfgScale] = useLocalStorage('horde_cfg', 7.0);
  const [seed, setSeed] = useLocalStorage('horde_seed', '');
  const [clipSkip, setClipSkip] = useLocalStorage('horde_clipskip', 1);

  // State Manajemen LoRA
  const [loras, setLoras] = useLocalStorage('horde_loras', []);

  // State LoRA Browser (Civitai)
  const [isLoraBrowserOpen, setIsLoraBrowserOpen] = useState(false);
  const [loraSearchQuery, setLoraSearchQuery] = useState('');
  const [loraBaseModelFilter, setLoraBaseModelFilter] = useState(''); 
  const [loraSearchResults, setLoraSearchResults] = useState([]);
  const [isSearchingLora, setIsSearchingLora] = useState(false);

  // State Parameter Tambahan / Toggles
  const [useKarras, setUseKarras] = useLocalStorage('horde_karras', true);
  const [allowSlowWorkers, setAllowSlowWorkers] = useLocalStorage('horde_slow_workers', true);
  const [useHiresFix, setUseHiresFix] = useLocalStorage('horde_hires', false);
  const [useTiling, setUseTiling] = useLocalStorage('horde_tiling', false);

  // Diperbarui: State Galeri Berubah Menjadi Riwayat Otomatis (History)
  const [history, setHistory] = useLocalStorage('horde_history_v2', []);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null); // State untuk Modal Detail

  // State Dinamis Sesi Saat Ini
  const [models, setModels] = useState([]);
  const [hordeStats, setHordeStats] = useState({ queued: 0, workers: 0 });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState(null);

  // Fetch Data AI Horde (Dibiarkan Bebas Tanpa Filter NSFW Sesuai Instruksi)
  useEffect(() => {
    const fetchHordeData = async () => {
      setModels(prev => prev.length === 0 ? [] : prev);
      try {
        const statsRes = await fetch('https://stablehorde.net/api/v2/status/performance');
        const statsData = await statsRes.json();
        setHordeStats({ queued: statsData.queued_requests || 0, workers: statsData.worker_count || 0 });

        const modelsRes = await fetch('https://stablehorde.net/api/v2/status/models');
        const modelsData = await modelsRes.json();

        const activeModels = modelsData.filter(m => m.type === 'image').sort((a, b) => b.count - a.count);
        setModels(activeModels);

        setSelectedModel(currentSelected => {
          if (!currentSelected && activeModels.length > 0) return activeModels[0].name;
          const isModelStillOnline = activeModels.some(m => m.name === currentSelected);
          if (!isModelStillOnline && activeModels.length > 0) return activeModels[0].name;
          return currentSelected;
        });
      } catch (err) {
        console.error("Gagal mengambil data dari AI Horde:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchHordeData();
    const interval = setInterval(fetchHordeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateRandomSeed = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0].toString();
  };

  // Pencarian LoRA di Civitai
  const fetchCivitaiLoras = async (query = '', baseModel = '') => {
    setIsSearchingLora(true);
    try {
      let url = `https://civitai.com/api/v1/models?types=LORA`;
      if (query.trim()) url += `&query=${encodeURIComponent(query)}`;
      if (baseModel) url += `&baseModels=${encodeURIComponent(baseModel)}`;
      if (!query.trim() && !baseModel) url += `&sort=Highest%20Rated`;
        
      const res = await fetch(url);
      const data = await res.json();
      setLoraSearchResults(data.items || []);
    } catch (err) {
      console.error("Gagal mengambil data LoRA dari Civitai:", err);
    } finally {
      setIsSearchingLora(false);
    }
  };

  useEffect(() => {
    if (isLoraBrowserOpen) {
      fetchCivitaiLoras(loraSearchQuery, loraBaseModelFilter);
    }
  }, [loraBaseModelFilter]);

  const openLoraBrowser = () => {
    setIsLoraBrowserOpen(true);
    if (loraSearchResults.length === 0) {
      fetchCivitaiLoras(loraSearchQuery, loraBaseModelFilter);
    }
  };

  const handleSelectLoraFromBrowser = (civitaiModel, selectedVersionId) => {
    const versionData = civitaiModel.modelVersions.find(v => v.id.toString() === selectedVersionId.toString());
    const versionName = versionData ? versionData.name : '';
    const loraId = selectedVersionId.toString();

    if (!loras.some(l => l.name === loraId)) {
      setLoras([...loras, { id: Date.now(), name: loraId, title: `${civitaiModel.name} (${versionName})`, strength: 1.0 }]);
    }
    setIsLoraBrowserOpen(false); 
  };

  const handleAddLoraManual = () => setLoras([...loras, { id: Date.now(), name: '', title: '', strength: 1.0 }]);
  const handleUpdateLora = (id, field, value) => setLoras(loras.map(l => l.id === id ? { ...l, [field]: value } : l));
  const handleRemoveLora = (id) => setLoras(loras.filter(l => l.id !== id));

  // --- Fungsi Generate Utama ---
  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel) return;

    setIsGenerating(true);
    setGeneratedImages([]); 
    setError(null);
    setStatusMessage('Menyiapkan parameter jaringan...');

    const fullPrompt = negativePrompt.trim() ? `${prompt} ### ${negativePrompt}` : prompt;
    const [width, height] = resolution.split('x').map(Number);

    const seedValue = seed.trim();
    const finalSeed = seedValue === '' ? generateRandomSeed() : /^\d+$/.test(seedValue) ? seedValue : generateRandomSeed();

    const activeLoras = loras.filter(l => l.name.trim() !== '').map(l => ({
        name: l.name.trim(), 
        model: parseFloat(l.strength),
        clip: parseFloat(l.strength)
    }));

    const baseParams = {
      sampler_name: sampler,
      steps: parseInt(steps),
      n: parseInt(batchSize), 
      width: width,
      height: height,
      cfg_scale: parseFloat(cfgScale),
      seed: finalSeed,
      karras: useKarras,
      tiling: useTiling,
      hires_fix: useHiresFix,
      clip_skip: parseInt(clipSkip)
    };

    if (activeLoras.length > 0) baseParams.loras = activeLoras;

    const payload = {
      prompt: fullPrompt,
      censor_nsfw: false, 
      slow_workers: allowSlowWorkers,
      models: [selectedModel],
      params: baseParams
    };

    try {
      setStatusMessage('Mengirim request ke Horde...');
      const res = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey.trim() || '0000000000'
        },
        body: JSON.stringify(payload)
      });

      const requestData = await res.json();
      if (!requestData.id) throw new Error(requestData.message || 'Gagal mendapatkan Request ID.');

      const requestId = requestData.id;
      let isDone = false;

      while (!isDone) {
        setStatusMessage('Menunggu eksekusi GPU...');
        await delay(3000);

        const checkRes = await fetch(`https://stablehorde.net/api/v2/generate/check/${requestId}`);
        const checkData = await checkRes.json();

        if (checkData.faulted) throw new Error('Worker GPU mengalami kegagalan. Coba kurangi parameter atau ganti model.');

        if (checkData.done) {
          isDone = true;
          setStatusMessage('Mengunduh hasil akhir...');

          const statusRes = await fetch(`https://stablehorde.net/api/v2/generate/status/${requestId}`);
          const statusData = await statusRes.json();

          if (statusData.generations && statusData.generations.length > 0) {
            // Pemrosesan output array gambar
            const processedImages = statusData.generations.map(gen => {
              const src = (gen.img.startsWith('http://') || gen.img.startsWith('https://')) ? gen.img : `data:image/webp;base64,${gen.img}`;
              return { url: src, seed: gen.seed || finalSeed };
            });
            
            setGeneratedImages(processedImages.map(p => p.url));

            // === OOM-SAFE AUTO HISTORY INGESTION ===
            const newHistoryEntries = processedImages.map((p, idx) => ({
              id: Date.now() + idx + Math.random(),
              image: p.url,
              prompt: prompt,
              negativePrompt: negativePrompt,
              model: selectedModel,
              resolution: resolution,
              sampler: sampler,
              steps: steps,
              cfgScale: cfgScale,
              seed: p.seed,
              clipSkip: clipSkip,
              loras: JSON.parse(JSON.stringify(loras)), // Deep copy array LoRA saat ini
              date: new Date().toLocaleString('id-ID')
            }));

            // Menyimpan riwayat otomatis hingga maksimal 40 gambar terbaru
            setHistory(prev => [...newHistoryEntries, ...prev].slice(0, 40));
          } else {
            throw new Error('Gambar diproses, namun tidak ada data yang dikembalikan.');
          }
        } else {
          if (checkData.wait_time > 0) setStatusMessage(`Dalam antrean. Sisa waktu: ${checkData.wait_time} detik...`);
        }
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } companions: {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const handleClear = () => {
    setPrompt('');
    setNegativePrompt('');
    setGeneratedImages([]);
    setError(null);
  };

  // Memuat kembali parameter riwayat gambar ke workspace kerja utama
  const handleLoadParameters = (item) => {
    setPrompt(item.prompt || '');
    setNegativePrompt(item.negativePrompt || '');
    setSelectedModel(item.model || '');
    setResolution(item.resolution || '1024x1024');
    setSampler(item.sampler || 'k_dpmpp_2m');
    setSteps(item.steps || 25);
    setCfgScale(item.cfgScale || 7.0);
    setSeed(item.seed || '');
    setClipSkip(item.clipSkip || 1);
    setLoras(item.loras || []);
    setActiveTab('generate'); // Lempar balik ke tab generator utama
    setSelectedHistoryItem(null); // Tutup modal
    alert('Seluruh parameter, model, dan struktur LoRA berhasil dikembalikan!');
  };

  const handleDeleteFromHistory = (idToRemove) => setHistory(history.filter(item => item.id !== idToRemove));

  const ToggleSwitch = ({ label, description, checked, onChange, isRed }) => (
    <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div>
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</span>
        {description && <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? (isRed ? 'bg-red-500' : 'bg-blue-600') : 'bg-gray-300'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans pb-10">

      {/* Header Panel */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Gen <span className="text-blue-600">Biji</span></h1>
            <nav className="hidden sm:flex space-x-1">
              <button onClick={() => setActiveTab('generate')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'generate' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Generator</button>
              {/* Diperbarui: Teks Tab berubah menjadi History */}
              <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>History ({history.length})</button>
            </nav>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="hidden md:flex items-center space-x-2 text-gray-600"><span className="font-semibold text-blue-600">{hordeStats.workers}</span> Workers</div>
            <div className="hidden md:flex items-center space-x-2 text-gray-600"><span className="font-semibold text-amber-600">{hordeStats.queued}</span> Antrean</div>
            <div className="flex items-center space-x-2 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span><span className="text-green-700 hidden sm:inline">Online</span></div>
          </div>
        </div>
        <div className="sm:hidden flex border-t border-gray-100">
          <button onClick={() => setActiveTab('generate')} className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'generate' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Generator</button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>History ({history.length})</button>
        </div>
      </header>

      {/* TAMPILAN GENERATOR UTAMA */}
      {activeTab === 'generate' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-down">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* KOLOM KIRI: SIDEBAR PENGATURAN */}
            <div className="lg:col-span-4 space-y-5">

              <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Horde API Key (Tersimpan Lokal)</label>
                <input
                  type="password" placeholder="Masukkan API Key (Opsional)"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm bg-gray-50"
                  value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 border-b pb-2">Pengaturan Utama</h2>
                <div>
                  <label className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <span>Model AI Aktif</span>
                    {isLoadingData && <span className="text-blue-500">Memuat...</span>}
                  </label>
                  <select
                    value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={isLoadingData}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:opacity-50"
                  >
                    {models.map((model) => (
                      <option key={model.name} value={model.name}>{model.name} ({model.count} workers)</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resolusi</label>
                    <select
                      value={resolution} onChange={(e) => setResolution(e.target.value)}
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
                      value={batchSize} onChange={(e) => setBatchSize(e.target.value)}
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
                    <button onClick={openLoraBrowser} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                      Browser
                    </button>
                    <button onClick={handleAddLoraManual} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
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
                        <button onClick={() => handleRemoveLora(lora.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors" title="Hapus LoRA ini">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </button>
                        <div className="pr-6">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 line-clamp-1">{lora.title ? lora.title : "Civitai ID"}</label>
                          <input type="text" value={lora.name} onChange={(e) => handleUpdateLora(lora.id, 'name', e.target.value)} placeholder="ID Civitai" className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white font-mono" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Strength</label>
                            <span className="font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[10px]">{lora.strength}</span>
                          </div>
                          <input type="range" min="-2" max="2" step="0.05" value={lora.strength} onChange={(e) => handleUpdateLora(lora.id, 'strength', e.target.value)} className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 border-b pb-2">KSampler & Tuning</h2>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sampling Method</label>
                  <select value={sampler} onChange={(e) => setSampler(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="k_euler_a">Euler a</option>
                    <option value="k_dpmpp_2m">DPM++ 2M</option>
                    <option value="k_dpmpp_sde">DPM++ SDE</option>
                    <option value="dpmsolver">DPM Solver</option>
                    <option value="k_dpm_2_a">DPM2 a</option>
                  </select>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sampling Steps</label><span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">{steps}</span></div>
                  <input type="range" min="10" max="50" value={steps} onChange={(e) => setSteps(e.target.value)} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CFG Scale</label><span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">{cfgScale}</span></div>
                  <input type="range" min="1" max="15" step="0.5" value={cfgScale} onChange={(e) => setCfgScale(e.target.value)} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clip Skip</label><span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">{clipSkip}</span></div>
                  <input type="range" min="1" max="12" step="1" value={clipSkip} onChange={(e) => setClipSkip(e.target.value)} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seed</label>
                  <input type="text" placeholder="Kosongkan untuk acak setiap generate" value={seed} onChange={(e) => setSeed(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono" />
                </div>
              </div>

              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm space-y-1">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 border-b pb-2">Parameter Tambahan</h2>
                <ToggleSwitch label="Karras Schedule" description="Kurangi noise pada langkah sampler." checked={useKarras} onChange={setUseKarras} />
                <ToggleSwitch label="Allow Slow Workers" description="Matikan untuk abaikan GPU lambat." checked={allowSlowWorkers} onChange={setAllowSlowWorkers} />
                <ToggleSwitch label="Hires Fix" description="Upscale & perbaiki detail gambar." checked={useHiresFix} onChange={setUseHiresFix} />
                <ToggleSwitch label="Tiling" description="Hasilkan pola tekstur menyambung." checked={useTiling} onChange={setUseTiling} />
              </div>

            </div>

            {/* KOLOM KANAN: AREA PROMPT & HASIL */}
            <div className="lg:col-span-8 flex flex-col space-y-6">

              <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prompt Positif</label>
                  <textarea
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all shadow-inner text-sm resize-y min-h-[120px]"
                    placeholder="Gambarkan visi Anda secara detail di sini..."
                    value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prompt Negatif</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 transition-all shadow-inner text-sm bg-red-50/30 resize-y min-h-[80px]"
                    placeholder="Apa yang ingin Anda hindari (misal: cacat, kualitas rendah)..."
                    value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim() || isLoadingData}
                    className={`flex-1 font-semibold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center text-sm ${isGenerating || !prompt.trim() || isLoadingData
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                      }`}
                >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {statusMessage || 'Memproses...'}
                      </span>
                    ) : `Generate ${batchSize > 1 ? batchSize + ' Gambar' : 'Gambar'}`}
                  </button>

                  <button onClick={handleClear} className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-5 rounded-xl transition-all active:scale-95 border border-gray-300 shadow-sm flex items-center justify-center">Clear Text</button>
                </div>
              </div>

              {/* Area Hasil Gambar Aktif (Tombol simpan dihilangkan karena sekarang otomatis masuk history) */}
              <div className="bg-white p-2 border border-gray-200 rounded-2xl shadow-sm min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">

                {generatedImages.length === 0 && !isGenerating && !error && (
                  <div className="text-center text-gray-400 flex flex-col items-center p-8">
                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <p className="font-medium text-gray-500">Kanvas Output Gambar</p>
                    <p className="text-sm mt-1">Gambar hasil render akan muncul di sini dan langsung dicatat ke History.</p>
                  </div>
                )}

                {isGenerating && (
                  <div className="flex flex-col items-center space-y-4 px-6 text-center z-10 bg-white/80 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin shadow-md"></div>
                    <div>
                      <p className="text-base font-bold text-gray-800">{statusMessage}</p>
                      <p className="text-xs text-gray-500 mt-1">Memproses {batchSize > 1 ? `${batchSize} gambar` : 'gambar'} pada klaster terdistribusi...</p>
                    </div>
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

            </div>
          </div>
        </main>
      )}

      {/* === TAMPILAN HALAMAN HISTORY GENERASI === */}
      {activeTab === 'history' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-down">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Riwayat Generasi (History)</h2>
                <p className="text-sm text-gray-500 mt-1">Seluruh hasil render otomatis tersimpan di sini secara lokal. Klik pada gambar untuk membedah detail metadata.</p>
              </div>
              {history.length > 0 && (
                <button onClick={() => { if (window.confirm('Hapus seluruh riwayat generasi Anda secara permanen?')) setHistory([]) }} className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors">
                  Wipe History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="text-lg font-medium text-gray-900">Belum Ada Riwayat Gambar</h3>
                <p className="text-sm text-gray-400 mt-1">Silakan lakukan generate gambar terlebih dahulu di tab Workspace.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedHistoryItem(item)} // Memicu Modal Detail
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
      )}

      {/* === MODAL PANEL DETAIL HISTORY MUTAKHIR === */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 animate-fade-in-down">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row shadow-2xl overflow-hidden border border-gray-200">
            
            {/* Sisi Kiri: Preview Gambar */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center p-4 relative group">
              <img src={selectedHistoryItem.image} alt="Detail view" className="max-w-full max-h-full object-contain rounded-xl" />
              <button 
                onClick={() => handleDeleteFromHistory(selectedHistoryItem.id) || setSelectedHistoryItem(null)}
                className="absolute bottom-4 left-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Hapus dari Riwayat
              </button>
            </div>

            {/* Sisi Kanan: Bedah Parameter & Metadata */}
            <div className="w-full md:w-[450px] border-t md:border-t-0 md:border-l border-gray-200 flex flex-col bg-white h-full">
              
              {/* Header Info Modal */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Metadata & Parameter Info</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{selectedHistoryItem.date}</p>
                </div>
                <button onClick={() => setSelectedHistoryItem(null)} className="text-gray-400 hover:text-gray-600 bg-gray-200/60 p-1.5 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              {/* Konten Scrollable Parameter */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Model AI Yang Digunakan</label>
                  <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800 font-semibold">{selectedHistoryItem.model}</div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Positive Prompt</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-700 max-h-36 overflow-y-auto select-all cursor-text whitespace-pre-wrap">{selectedHistoryItem.prompt}</div>
                </div>

                {selectedHistoryItem.negativePrompt && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Negative Prompt</label>
                    <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl font-mono text-gray-600 max-h-24 overflow-y-auto select-all cursor-text whitespace-pre-wrap">{selectedHistoryItem.negativePrompt}</div>
                  </div>
                )}

                {/* Grid Parameter Teknis KSampler */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Sampler</span>
                    <span className="font-mono font-bold text-gray-700 text-sm">{selectedHistoryItem.sampler}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Seed Sejati</span>
                    <span className="font-mono font-bold text-indigo-700 text-sm select-all">{selectedHistoryItem.seed}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Steps</span>
                    <span className="font-mono font-bold text-gray-700 text-sm">{selectedHistoryItem.steps}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">CFG Scale</span>
                    <span className="font-mono font-bold text-gray-700 text-sm">{selectedHistoryItem.cfgScale}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Resolusi</span>
                    <span className="font-mono font-bold text-gray-700 text-sm">{selectedHistoryItem.resolution}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Clip Skip</span>
                    <span className="font-mono font-bold text-gray-700 text-sm">{selectedHistoryItem.clipSkip}</span>
                  </div>
                </div>

                {/* Struktur Tumpukan LoRA yang Aktif saat itu */}
                {selectedHistoryItem.loras && selectedHistoryItem.loras.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tumpukan LoRA Yang Terkunci</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {selectedHistoryItem.loras.map((l, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg font-mono text-[11px]">
                          <span className="text-gray-700 font-bold truncate pr-2">{l.title || `Civitai ID: ${l.name}`}</span>
                          <span className="bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded text-[10px]">w: {l.strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Action Footer: Kirim Balik Ke Generator */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button 
                  onClick={() => handleLoadParameters(selectedHistoryItem)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 text-xs flex justify-center items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Kembalikan ke Panel Kerja (Load Params)
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAMPILAN MODAL LORA BROWSER */}
      {isLoraBrowserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 animate-fade-in-down">
          <div className="bg-white rounded-3xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
            
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                Browser LoRA Civitai
              </h2>
              <button onClick={() => setIsLoraBrowserOpen(false)} className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-xl transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <form onSubmit={(e) => { e.preventDefault(); fetchCivitaiLoras(loraSearchQuery, loraBaseModelFilter); }} className="flex gap-3 max-w-4xl mx-auto">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Cari LoRA..." 
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm shadow-sm"
                    value={loraSearchQuery} onChange={(e) => setLoraSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  value={loraBaseModelFilter}
                  onChange={(e) => setLoraBaseModelFilter(e.target.value)}
                  className="w-48 py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-sm font-semibold text-gray-700 shadow-sm cursor-pointer"
                >
                  <option value="">Semua Base Model</option>
                  <option value="SD 1.5">SD 1.5</option>
                  <option value="SDXL 1.0">SDXL 1.0</option>
                  <option value="Pony">Pony</option>
                  <option value="Illustrious">Illustrious</option>
                </select>

                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">Cari</button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-100/50">
              {isSearchingLora ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500 font-bold animate-pulse">Menghubungi Server Civitai...</p>
                </div>
              ) : loraSearchResults.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  <h3 className="text-lg font-bold text-gray-800">Tidak ada hasil</h3>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {loraSearchResults.map((lora) => (
                    <LoraCard key={lora.id} lora={lora} onSelect={handleSelectLoraFromBrowser} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WebUI;