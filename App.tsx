import React, { useState, useEffect, useRef } from 'react';
import { TimelineSlot, GeminiModel } from './types';
import { BACKGROUND_MUSIC_URL, MODEL_OPTIONS } from './constants';
import { generateAgeImage } from './services/geminiService';
import TimelineGrid from './components/TimelineGrid';
import ThreeDWall from './components/ThreeDWall';

function App() {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [timeline, setTimeline] = useState<TimelineSlot[]>([]);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.FLASH_IMAGE);
  const [viewMode, setViewMode] = useState<'grid' | 'wall'>('grid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Timeline based on Age
  useEffect(() => {
    if (currentAge > 0) {
      // Create slots for every 10 years: 0, 10, 20... up to currentAge
      const slots: TimelineSlot[] = [];
      for (let i = 0; i <= currentAge; i += 10) {
        // Find existing data if we are resizing timeline to preserve uploads
        const existing = timeline.find(t => t.age === i);
        slots.push(existing || { age: i, image: null, isGenerated: false, isLoading: false });
      }
      setTimeline(slots);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAge]);

  // Audio Control
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleUpload = (age: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setTimeline(prev => prev.map(slot => 
        slot.age === age ? { ...slot, image: base64String, isGenerated: false, error: undefined } : slot
      ));
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (age: number) => {
    setTimeline(prev => prev.map(slot => 
        slot.age === age ? { ...slot, image: null, isGenerated: false } : slot
    ));
  };

  const generateMissingPhotos = async () => {
    const referenceSlots = timeline.filter(t => t.image !== null && !t.isGenerated);
    
    if (referenceSlots.length === 0) {
      alert("Please upload at least one original photo as a reference.");
      return;
    }

    const referenceImages = referenceSlots.map(t => t.image as string);
    const missingSlots = timeline.filter(t => t.image === null);

    if (missingSlots.length === 0) {
      alert("Timeline is complete! Switching to Wall View.");
      setViewMode('wall');
      setIsPlaying(true);
      return;
    }

    setIsGenerating(true);

    // Process sequentially to avoid rate limits and ensure order
    // In a production app, could be Promise.all if rate limits allow
    for (const slot of missingSlots) {
      // Update loading state
      setTimeline(prev => prev.map(s => s.age === slot.age ? { ...s, isLoading: true } : s));

      try {
        const generatedImage = await generateAgeImage(selectedModel, slot.age, referenceImages);
        
        setTimeline(prev => prev.map(s => 
          s.age === slot.age 
            ? { ...s, image: generatedImage, isGenerated: true, isLoading: false } 
            : s
        ));
      } catch (error) {
        console.error(`Failed to generate for age ${slot.age}`, error);
        setTimeline(prev => prev.map(s => 
          s.age === slot.age 
            ? { ...s, isLoading: false, error: "Generation failed" } 
            : s
        ));
      }
    }

    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <audio ref={audioRef} src={BACKGROUND_MUSIC_URL} loop />

      {/* Header */}
      <header className="p-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">
              LifeJourney AI
            </h1>
            <p className="text-slate-400 text-sm">Reconstruct your timeline with Generative AI</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 uppercase font-bold">Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-teal-500"
              >
                {MODEL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]' : 'bg-slate-700 text-slate-400'}`}
              title={isPlaying ? "Pause Music" : "Play Music"}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        
        {/* Input Section - Only show in Grid view */}
        {viewMode === 'grid' && (
          <div className="mb-8 flex flex-col md:flex-row items-end gap-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <div className="flex-1">
               <label className="block text-sm font-medium text-slate-400 mb-2">My Current Age</label>
               <input 
                 type="number" 
                 value={currentAge}
                 onChange={(e) => setCurrentAge(Math.min(120, Math.max(0, parseInt(e.target.value) || 0)))}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-xl font-mono text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
               />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400 mb-2">Instructions</p>
              <p className="text-slate-300 text-sm">
                1. Enter your age to create the timeline.<br/>
                2. Upload photos for the ages you have available.<br/>
                3. Click <strong>Generate Missing</strong> to fill the gaps.
              </p>
            </div>
            <div>
              <button
                onClick={generateMissingPhotos}
                disabled={isGenerating || currentAge === 0}
                className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                  isGenerating 
                    ? 'bg-slate-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 shadow-purple-900/20'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Generating...
                  </span>
                ) : 'Generate Missing Photos'}
              </button>
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800 p-1 rounded-full inline-flex">
            <button 
              onClick={() => { setViewMode('grid'); setIsPlaying(false); }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Timeline Grid
            </button>
            <button 
              onClick={() => { setViewMode('wall'); setIsPlaying(true); }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'wall' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              3D Photo Wall
            </button>
          </div>
        </div>

        {/* Views */}
        <div className="min-h-[500px] relative">
           {viewMode === 'grid' ? (
             <TimelineGrid slots={timeline} onUpload={handleUpload} onRemove={handleRemove} />
           ) : (
             <ThreeDWall items={timeline.filter(t => t.image !== null)} />
           )}
        </div>
        
      </main>
      
      <footer className="p-4 text-center text-slate-600 text-sm">
        <p>Powered by Gemini 2.5/3.0 Multimodal AI. Ensure your API Key is set in the environment.</p>
      </footer>
    </div>
  );
}

export default App;