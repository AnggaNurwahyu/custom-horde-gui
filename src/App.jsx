import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import SidebarSettings from './components/SidebarSettings';
import PromptSection from './components/PromptSection';
import OutputCanvas from './components/OutputCanvas';
import HistoryTab from './components/HistoryTab';
import HistoryDetailModal from './components/HistoryDetailModal';
import LoraBrowserModal from './components/LoraBrowserModal';

const WebUI = () => {
  const [activeTab, setActiveTab] = useState('generate'); 

  // State Input Utama
  const [prompt, setPrompt] = useLocalStorage('horde_prompt', '');
  const [negativePrompt, setNegativePrompt] = useLocalStorage('horde_neg_prompt', '');
  const [apiKey, setApiKey] = useLocalStorage('horde_api_key', '');

  // State Pengaturan Utama
  const [selectedModel, setSelectedModel] = useLocalStorage('horde_model', '');
  const [selectedWorker, setSelectedWorker] = useLocalStorage('horde_worker', ''); // State Target Worker
  const [resolution, setResolution] = useLocalStorage('horde_resolution', '1024x1024');
  const [batchSize, setBatchSize] = useLocalStorage('horde_batch_size', 1); 

  // State KSampler & Tuning
  const [sampler, setSampler] = useLocalStorage('horde_sampler', 'k_dpmpp_2m');
  const [steps, setSteps] = useLocalStorage('horde_steps', 25);
  const [cfgScale, setCfgScale] = useLocalStorage('horde_cfg', 7.0);
  const [seed, setSeed] = useLocalStorage('horde_seed', '');
  const [clipSkip, setClipSkip] = useLocalStorage('horde_clipskip', 1);

  const [loras, setLoras] = useLocalStorage('horde_loras', []);

  // State LoRA Browser 
  const [isLoraBrowserOpen, setIsLoraBrowserOpen] = useState(false);
  const [loraSearchQuery, setLoraSearchQuery] = useState('');
  const [loraBaseModelFilter, setLoraBaseModelFilter] = useState(''); 
  const [loraSearchResults, setLoraSearchResults] = useState([]);
  const [isSearchingLora, setIsSearchingLora] = useState(false);

  // State Toggles
  const [useTrustedWorkers, setUseTrustedWorkers] = useLocalStorage('horde_trusted_workers', false); // State Trusted Worker
  const [useKarras, setUseKarras] = useLocalStorage('horde_karras', true);
  const [allowSlowWorkers, setAllowSlowWorkers] = useLocalStorage('horde_slow_workers', true);
  const [useHiresFix, setUseHiresFix] = useLocalStorage('horde_hires', false);
  const [useTiling, setUseTiling] = useLocalStorage('horde_tiling', false);

  const [gallery, setGallery] = useLocalStorage('horde_gallery', []);
  const [history, setHistory] = useLocalStorage('horde_history_v2', []);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null); 

  // State Dinamis Sesi Saat Ini
  const [models, setModels] = useState([]);
  const [workersList, setWorkersList] = useState([]); // List data worker dari API
  const [hordeStats, setHordeStats] = useState({ queued: 0, workers: 0 });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // State Generasi & Progres QoL
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [genProgress, setGenProgress] = useState({ queue: 0, waitTime: 0, status: 'Menyiapkan...' });
  const [generatedImages, setGeneratedImages] = useState([]); 
  const [error, setError] = useState(null);

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

        // Fetch Daftar Worker Aktif (Untuk Datalist/Dropdown Worker Target)
        const workersRes = await fetch('https://stablehorde.net/api/v2/workers?type=image');
        const workersData = await workersRes.json();
        const activeWorkers = workersData
          .filter(w => w.online && !w.maintenance_mode)
          .sort((a, b) => (b.requests_fulfilled || 0) - (a.requests_fulfilled || 0));
        setWorkersList(activeWorkers);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loraBaseModelFilter]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel) return;

    setIsGenerating(true);
    setGeneratedImages([]); 
    setError(null);
    setStatusMessage('Mengirim request ke server...');
    setGenProgress({ queue: 0, waitTime: 0, status: 'requesting' });

    const fullPrompt = negativePrompt.trim() ? `${prompt} ### ${negativePrompt}` : prompt;
    const [width, height] = resolution.split('x').map(Number);

    const seedValue = seed.trim();
    const finalSeed = seedValue === '' ? generateRandomSeed() : /^\d+$/.test(seedValue) ? seedValue : generateRandomSeed();

    // 1. FIX LORA ARTBOT: Menyisipkan 'is_version: true'
    const activeLoras = loras.filter(l => l.name.trim() !== '').map(l => ({
        name: l.name.trim(), 
        model: parseFloat(l.strength),
        clip: parseFloat(l.strength),
        is_version: true 
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
      trusted_workers: useTrustedWorkers, // 2. FIX TRUSTED WORKER
      slow_workers: allowSlowWorkers,
      models: [selectedModel],
      params: baseParams
    };

    // 3. FIX TARGET WORKER: Menyisipkan array ID Worker jika pengguna memilih target
    if (selectedWorker && selectedWorker.trim() !== '') {
      payload.workers = [selectedWorker.trim()];
    }

    try {
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
        await delay(3000);

        const checkRes = await fetch(`https://stablehorde.net/api/v2/generate/check/${requestId}`);
        const checkData = await checkRes.json();

        if (checkData.faulted) throw new Error('Worker GPU mengalami kegagalan. Pastikan Worker Target sanggup memuat jumlah LoRA (max_loras) yang diminta.');

        if (checkData.done) {
          isDone = true;
          setGenProgress(prev => ({ ...prev, status: 'downloading' }));
          setStatusMessage('Proses selesai, mengunduh gambar...');

          const statusRes = await fetch(`https://stablehorde.net/api/v2/generate/status/${requestId}`);
          const statusData = await statusRes.json();

          if (statusData.generations && statusData.generations.length > 0) {
            const processedImages = statusData.generations.map(gen => {
              const src = (gen.img.startsWith('http://') || gen.img.startsWith('https://')) ? gen.img : `data:image/webp;base64,${gen.img}`;
              return { url: src, seed: gen.seed || finalSeed, worker_name: gen.worker_name };
            });
            
            setGeneratedImages(processedImages.map(p => p.url));

            const newHistoryEntries = processedImages.map((p, idx) => ({
              id: Date.now() + idx + Math.random(),
              image: p.url,
              prompt: prompt,
              negativePrompt: negativePrompt,
              model: selectedModel,
              worker: p.worker_name || selectedWorker, // Mencatat nama worker yang mengeksekusi
              resolution: resolution,
              sampler: sampler,
              steps: steps,
              cfgScale: cfgScale,
              seed: p.seed,
              clipSkip: clipSkip,
              loras: JSON.parse(JSON.stringify(loras)), 
              date: new Date().toLocaleString('id-ID')
            }));

            setHistory(prev => [...newHistoryEntries, ...prev].slice(0, 40));
          } else {
            throw new Error('Gambar diproses, namun tidak ada data yang dikembalikan.');
          }
        } else {
          setGenProgress({
            queue: checkData.queue_position || 0,
            waitTime: checkData.wait_time || 0,
            status: checkData.processing > 0 ? 'rendering' : 'waiting'
          });
          setStatusMessage(checkData.processing > 0 ? 'Sedang dirender oleh GPU...' : 'Menunggu Antrean Jaringan...');
        }
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
      setGenProgress({ queue: 0, waitTime: 0, status: '' });
    }
  };

  const handleClear = () => {
    setPrompt('');
    setNegativePrompt('');
    setGeneratedImages([]);
    setError(null);
  };

  const handleLoadParameters = (item) => {
    setPrompt(item.prompt || '');
    setNegativePrompt(item.negativePrompt || '');
    setSelectedModel(item.model || '');
    if (item.worker) {
      setSelectedWorker(item.worker);
    } else {
      setSelectedWorker('');
    }
    setResolution(item.resolution || '1024x1024');
    setSampler(item.sampler || 'k_dpmpp_2m');
    setSteps(item.steps || 25);
    setCfgScale(item.cfgScale || 7.0);
    setSeed(item.seed || '');
    setClipSkip(item.clipSkip || 1);
    setLoras(item.loras || []);
    setActiveTab('generate'); 
    setSelectedHistoryItem(null); 
  };

  const handleDeleteFromHistory = (idToRemove) => setHistory(history.filter(item => item.id !== idToRemove));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-10">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        historyLength={history.length} 
        hordeStats={hordeStats} 
      />

      {activeTab === 'generate' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in-down">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <SidebarSettings 
              apiKey={apiKey} setApiKey={setApiKey}
              selectedModel={selectedModel} setSelectedModel={setSelectedModel} models={models} isLoadingData={isLoadingData}
              selectedWorker={selectedWorker} setSelectedWorker={setSelectedWorker} workersList={workersList}
              resolution={resolution} setResolution={setResolution}
              batchSize={batchSize} setBatchSize={setBatchSize}
              openLoraBrowser={() => setIsLoraBrowserOpen(true)}
              handleAddLoraManual={() => setLoras([...loras, { id: Date.now(), name: '', title: '', strength: 1.0, is_version: true }])}
              loras={loras} handleRemoveLora={(id) => setLoras(loras.filter(l => l.id !== id))}
              handleUpdateLora={(id, field, value) => setLoras(loras.map(l => l.id === id ? { ...l, [field]: value } : l))}
              sampler={sampler} setSampler={setSampler}
              steps={steps} setSteps={setSteps}
              cfgScale={cfgScale} setCfgScale={setCfgScale}
              clipSkip={clipSkip} setClipSkip={setClipSkip}
              seed={seed} setSeed={setSeed}
              useTrustedWorkers={useTrustedWorkers} setUseTrustedWorkers={setUseTrustedWorkers}
              useKarras={useKarras} setUseKarras={setUseKarras}
              allowSlowWorkers={allowSlowWorkers} setAllowSlowWorkers={setAllowSlowWorkers}
              useHiresFix={useHiresFix} setUseHiresFix={setUseHiresFix}
              useTiling={useTiling} setUseTiling={setUseTiling}
            />

            <div className="lg:col-span-8 flex flex-col space-y-6">
              <PromptSection 
                prompt={prompt} setPrompt={setPrompt}
                negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt}
                onGenerate={handleGenerate} onClear={handleClear}
                isGenerating={isGenerating} isLoadingData={isLoadingData} batchSize={batchSize}
              />

              <OutputCanvas 
                generatedImages={generatedImages}
                isGenerating={isGenerating}
                genProgress={genProgress}
                error={error}
                statusMessage={statusMessage}
              />
            </div>
          </div>
        </main>
      )}

      <HistoryTab 
        activeTab={activeTab} history={history} setHistory={setHistory} onSelectItem={setSelectedHistoryItem} 
      />

      <HistoryDetailModal 
        item={selectedHistoryItem} onClose={() => setSelectedHistoryItem(null)}
        onDelete={handleDeleteFromHistory} onLoadParameters={handleLoadParameters}
      />

      <LoraBrowserModal 
        isOpen={isLoraBrowserOpen} onClose={() => setIsLoraBrowserOpen(false)}
        searchQuery={loraSearchQuery} setSearchQuery={setLoraSearchQuery}
        baseModelFilter={loraBaseModelFilter} setBaseModelFilter={setLoraBaseModelFilter}
        searchResults={loraSearchResults} isSearching={isSearchingLora}
        onSearch={() => fetchCivitaiLoras(loraSearchQuery, loraBaseModelFilter)}
        onSelectLora={(civitaiModel, selectedVersionId) => {
          const versionData = civitaiModel.modelVersions.find(v => v.id.toString() === selectedVersionId.toString());
          const versionName = versionData ? versionData.name : '';
          const loraId = selectedVersionId.toString();

          if (!loras.some(l => l.name === loraId)) {
            setLoras([...loras, { id: Date.now(), name: loraId, title: `${civitaiModel.name} (${versionName})`, strength: 1.0, is_version: true }]);
          }
          setIsLoraBrowserOpen(false);
        }}
      />

    </div>
  );
};

export default WebUI;