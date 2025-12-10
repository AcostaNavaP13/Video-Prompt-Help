import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Save, Sparkles, Video, Aperture, Sun, Palette, Monitor, Camera, History, Trash2, Globe, Loader2, Info, Coffee, X, Ban, Ratio, Gauge, BookOpen, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

// --- Domain Models & Data ---

const CAMERA_MOVEMENTS = [
  { id: 'staticShot', label: 'Static Shot (Cámara fija)', tag: 'Static shot' },
  { id: 'slowPanRight', label: 'Slow Pan Right (Paneo lento)', tag: 'Slow pan right' },
  { id: 'trackingShot', label: 'Tracking Shot (Seguimiento)', tag: 'Tracking shot' },
  { id: 'lowAnglePushIn', label: 'Low Angle Push In (Contrapicado + zoom)', tag: 'Low angle push in' },
  { id: 'aerialDrone', label: 'Aerial Drone View (Vista de dron)', tag: 'Aerial drone view' },
  { id: 'handheldShaky', label: 'Handheld Shaky (Cámara en mano)', tag: 'Handheld shaky cam' },
  { id: 'orbitShot', label: 'Orbit Shot (Orbital/360)', tag: 'Orbit shot' },
  { id: 'fpvFastDrone', label: 'FPV Fast Drone (Dron rápido)', tag: 'FPV fast drone' },
];

const LIGHTING_OPTIONS = [
  { id: 'goldenHour', label: 'Golden Hour (Atardecer)', tag: 'golden hour lighting' },
  { id: 'cinematicMoody', label: 'Cinematic Moody (Dramático)', tag: 'cinematic moody lighting' },
  { id: 'neonCyberpunk', label: 'Neon Cyberpunk (Neón)', tag: 'neon cyberpunk lighting' },
  { id: 'softNatural', label: 'Soft Natural (Luz ventana)', tag: 'soft natural window light' },
  { id: 'harshSpotlight', label: 'Harsh Spotlight (Foco duro)', tag: 'harsh spotlight lighting' },
  { id: 'bioluminescent', label: 'Bioluminescent (Mágico)', tag: 'bioluminescent glow' },
  { id: 'studio', label: 'Studio Lighting (Estudio)', tag: 'professional studio lighting' },
];

const VISUAL_STYLES = [
  { id: 'photorealistic', label: 'Photorealistic Film (Cine)', tag: 'photorealistic film' },
  { id: 'anime', label: 'Anime Style (Japonés)', tag: 'anime style' },
  { id: 'render3D', label: '3D Render (Unreal Engine)', tag: '3d render unreal engine 5' },
  { id: 'vintage50s', label: 'Vintage 1950s (Retro)', tag: 'vintage 1950s look' },
  { id: 'claymation', label: 'Claymation (Stop motion)', tag: 'claymation stop-motion' },
  { id: 'macro', label: 'Macro (Detalle extremo)', tag: 'macro close-up' },
  { id: 'vaporwave', label: 'Vaporwave (Estética 80s)', tag: 'vaporwave aesthetic' },
];

const RESOLUTIONS = [
  { id: '4k', label: '4K UHD', tag: '4K' },
  { id: '8k', label: '8K Ultra HD', tag: '8K' },
  { id: 'cinematic', label: 'Cinematic Scope', tag: 'cinematic widescreen' },
];

const LENSES = [
  { id: '35mm', label: '35mm Film', tag: '35mm film grain' },
  { id: '50mm', label: '50mm Prime', tag: '50mm lens' },
  { id: 'anamorphic', label: 'Anamorphic (Cine)', tag: 'anamorphic lens' },
  { id: 'fisheye', label: 'Fisheye (Ojo de pez)', tag: 'fisheye lens' },
];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 (TV/YouTube)', tag: '--ar 16:9' },
  { id: '9:16', label: '9:16 (TikTok/Reels)', tag: '--ar 9:16' },
  { id: '1:1', label: '1:1 (Square)', tag: '--ar 1:1' },
  { id: '2.35:1', label: '2.35:1 (Cinema)', tag: '--ar 2.35:1' },
];

const MOTION_SPEEDS = [
  { id: 'slow', label: 'Slow Motion', tag: 'slow motion' },
  { id: 'normal', label: 'Normal Speed', tag: '' }, // Empty tag implies normal
  { id: 'fast', label: 'Fast Paced', tag: 'fast paced' },
  { id: 'hyperlapse', label: 'Hyperlapse', tag: 'hyperlapse speed' },
];

const MAGIC_TAGS = "award winning, highly detailed, 8k resolution, trending on artstation, unreal engine 5 render, masterpiece, sharp focus";

// --- Tutorial Data ---
const TUTORIAL_STEPS = [
  {
    title: "Bienvenido al Director IA",
    desc: "Esta herramienta profesional te ayuda a crear prompts perfectos para modelos de video como Runway, Pika o Sora. Olvídate de traducir o memorizar términos técnicos.",
    icon: <Video className="w-12 h-12 text-indigo-400" />
  },
  {
    title: "1. Define tu Escena",
    desc: "Escribe en ESPAÑOL qué quieres ver (Sujeto) y dónde (Entorno). Nuestro motor traducirá y optimizará tus ideas al inglés automáticamente.",
    icon: <Globe className="w-12 h-12 text-blue-400" />
  },
  {
    title: "2. Control Técnico",
    desc: "Ajusta la cámara, iluminación y lentes como un director de cine real. Usa los selectores para dar el look exacto que necesitas (Cine, Anime, 3D, etc.).",
    icon: <Camera className="w-12 h-12 text-emerald-400" />
  },
  {
    title: "3. Magia y Salida",
    desc: "Activa 'Magic Enhancer' para calidad instantánea. Copia el prompt final optimizado y úsalo en tu generador de video favorito.",
    icon: <Sparkles className="w-12 h-12 text-yellow-400" />
  }
];

// --- Utility Hook for Debouncing ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Translation Utility ---
const translateText = async (text: string): Promise<string> => {
  if (!text.trim()) return '';
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|en`);
    const data = await response.json();
    return data.responseData.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

// --- Components ---

const AdPlaceholder = () => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden group mt-6">
    <div className="flex items-center gap-1.5 opacity-40 mb-1">
      <Info size={10} />
      <span className="text-[10px] uppercase tracking-widest font-semibold">Espacio Patrocinado</span>
    </div>
    <div className="w-full bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-lg border border-slate-700/50 border-dashed flex flex-col items-center justify-center min-h-[100px] transition-all group-hover:border-slate-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '12px 12px'}}></div>
        <span className="text-slate-500 text-xs font-medium z-10">Anuncio 300x100</span>
    </div>
  </div>
);

// --- Main Application Component ---

export default function App() {
  // --- Core State ---
  const [subject, setSubject] = useState('');
  const [environment, setEnvironment] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  
  // --- Translation State ---
  const [translatedSubject, setTranslatedSubject] = useState('');
  const [translatedEnvironment, setTranslatedEnvironment] = useState('');
  const [translatedNegative, setTranslatedNegative] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // --- Technical State ---
  const [camera, setCamera] = useState(CAMERA_MOVEMENTS[3].tag);
  const [lighting, setLighting] = useState(LIGHTING_OPTIONS[5].tag);
  const [style, setStyle] = useState(VISUAL_STYLES[0].tag);
  const [resolution, setResolution] = useState(RESOLUTIONS[1].tag);
  const [lens, setLens] = useState(LENSES[0].tag);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].tag);
  const [motionSpeed, setMotionSpeed] = useState(MOTION_SPEEDS[1].tag);
  const [useMagicEnhance, setUseMagicEnhance] = useState(false);
  
  const [extraTags, setExtraTags] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [finalNegative, setFinalNegative] = useState('');
  
  // --- UX State ---
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showDonateModal, setShowDonateModal] = useState(false);

  // --- Tutorial State ---
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // --- Debouncing ---
  const debouncedSubject = useDebounce(subject, 800);
  const debouncedEnvironment = useDebounce(environment, 800);
  const debouncedNegative = useDebounce(negativePrompt, 800);

  // --- Init (Tutorial Check) ---
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('avd_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    localStorage.setItem('avd_tutorial_seen', 'true');
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const nextTutorialStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      closeTutorial();
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(prev => prev - 1);
    }
  };

  // --- Translation Logic ---
  useEffect(() => {
    const performTranslation = async () => {
      if (!debouncedSubject && !debouncedEnvironment && !debouncedNegative) {
        setTranslatedSubject('');
        setTranslatedEnvironment('');
        setTranslatedNegative('');
        return;
      }

      setIsTranslating(true);
      
      const subjPromise = debouncedSubject ? translateText(debouncedSubject) : Promise.resolve('');
      const envPromise = debouncedEnvironment ? translateText(debouncedEnvironment) : Promise.resolve('');
      const negPromise = debouncedNegative ? translateText(debouncedNegative) : Promise.resolve('');

      const [subjEn, envEn, negEn] = await Promise.all([subjPromise, envPromise, negPromise]);
      
      setTranslatedSubject(subjEn);
      setTranslatedEnvironment(envEn);
      setTranslatedNegative(negEn);
      setIsTranslating(false);
    };

    performTranslation();
  }, [debouncedSubject, debouncedEnvironment, debouncedNegative]);

  // --- Prompt Construction Logic ---
  useEffect(() => {
    const pieces = [];
    
    // 1. Technical Prefix
    if (camera) pieces.push(camera);
    if (motionSpeed) pieces.push(motionSpeed);
    
    // 2. Core Content (Translated or Raw)
    const subjFinal = translatedSubject || subject.trim();
    if (subjFinal) pieces.push(subjFinal);
    
    const envFinal = translatedEnvironment || environment.trim();
    if (envFinal) pieces.push(`in ${envFinal}`);
    
    // 3. Modifiers
    pieces.push(lighting);
    pieces.push(style);
    pieces.push(resolution);
    pieces.push(lens);

    // 4. Extras
    const extras = extraTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    pieces.push(...extras);

    // 5. Magic Enhancer
    if (useMagicEnhance) {
        pieces.push(MAGIC_TAGS);
    }

    // 6. Suffixes (Aspect Ratio)
    pieces.push(aspectRatio);

    setFinalPrompt(pieces.join(', '));

    // Construct Negative Prompt
    const negPieces = [];
    const negTranslated = translatedNegative || negativePrompt.trim();
    if (negTranslated) negPieces.push(negTranslated);
    setFinalNegative(negPieces.join(', '));

  }, [translatedSubject, translatedEnvironment, translatedNegative, subject, environment, negativePrompt, camera, lighting, style, resolution, lens, extraTags, aspectRatio, motionSpeed, useMagicEnhance]);

  // --- Handlers ---
  
  const legacyCopy = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("Fallback copy failed", err);
      return false;
    }
  };

  const handleCopy = () => {
    const textToCopy = finalPrompt + (finalNegative ? ` --no ${finalNegative}` : '');

    const onSuccess = () => {
      setCopied(true);
      addToHistory(textToCopy);
      setShowDonateModal(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(onSuccess)
        .catch((err) => {
          console.warn("Clipboard API failed", err);
          if (legacyCopy(textToCopy)) onSuccess();
        });
    } else {
      if (legacyCopy(textToCopy)) onSuccess();
    }
  };

  const addToHistory = (prompt: string) => {
    if (!history.includes(prompt)) {
      setHistory(prev => [prompt, ...prev].slice(0, 10));
    }
  };

  const clearHistory = () => setHistory([]);

  const randomize = () => {
    const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    
    if (!subject) setSubject('Un samurai cibernético futurista');
    if (!environment) setEnvironment('una calle de Tokio lluviosa con luces de neón');

    setCamera(randomItem(CAMERA_MOVEMENTS).tag);
    setLighting(randomItem(LIGHTING_OPTIONS).tag);
    setStyle(randomItem(VISUAL_STYLES).tag);
    setResolution(randomItem(RESOLUTIONS).tag);
    setLens(randomItem(LENSES).tag);
    setAspectRatio(randomItem(ASPECT_RATIOS).tag);
    setMotionSpeed(randomItem(MOTION_SPEEDS).tag);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-20 md:pb-0 relative">
      
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
              AI Video Director
            </h1>
            <h1 className="text-xl font-bold text-indigo-400 sm:hidden">AVD</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setShowTutorial(true); setTutorialStep(0); }}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Ver Tutorial"
            >
              <BookOpen size={20} />
            </button>
            <button 
                onClick={randomize}
                className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors border border-slate-700"
            >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="hidden sm:inline">Aleatorio</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
        
        {/* Left Column: Controls (Span 8) */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          
          {/* 1. SCENE CONTENT */}
          <section className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Monitor className="w-4 h-4" /> Escena (Español)
              </h2>
              {isTranslating && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
                  <Globe className="w-3 h-3" /> Traduciendo...
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Sujeto y Acción</label>
                <textarea 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Un colchón Lester mostrando sus capas internas..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                  rows={2}
                />
                {translatedSubject && translatedSubject !== subject && (
                  <div className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500 px-1">
                    <Globe className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                    <span className="italic">{translatedSubject}</span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Entorno</label>
                <input 
                  type="text"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  placeholder="Ej: En un estudio de fotografía limpio e iluminado..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                />
                 {translatedEnvironment && translatedEnvironment !== environment && (
                  <div className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500 px-1">
                    <Globe className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                    <span className="italic">{translatedEnvironment}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 2. TECHNICAL SETTINGS */}
          <section className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
             <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Técnica & Composición
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <SelectGroup label="Movimiento de Cámara" icon={<Video size={14}/>} value={camera} setValue={setCamera} options={CAMERA_MOVEMENTS} />
              <SelectGroup label="Velocidad / Tiempo" icon={<Gauge size={14}/>} value={motionSpeed} setValue={setMotionSpeed} options={MOTION_SPEEDS} />
              <SelectGroup label="Iluminación" icon={<Sun size={14}/>} value={lighting} setValue={setLighting} options={LIGHTING_OPTIONS} />
              <SelectGroup label="Estilo Visual" icon={<Palette size={14}/>} value={style} setValue={setStyle} options={VISUAL_STYLES} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                <SelectGroup label="Lente / Óptica" icon={<Aperture size={14}/>} value={lens} setValue={setLens} options={LENSES} />
                
                {/* Aspect Ratio Selector */}
                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                        <Ratio size={14} /> Relación de Aspecto
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                        {ASPECT_RATIOS.map(ratio => (
                            <button
                                key={ratio.id}
                                onClick={() => setAspectRatio(ratio.tag)}
                                className={`text-[10px] py-2 rounded-md font-medium transition-all border ${
                                    aspectRatio === ratio.tag
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                                }`}
                            >
                                {ratio.id}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </section>

          {/* 3. ADVANCED & EXTRAS */}
          <section className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Avanzado
                </h2>
                
                {/* Magic Switch */}
                <button 
                    onClick={() => setUseMagicEnhance(!useMagicEnhance)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        useMagicEnhance 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white shadow-lg shadow-purple-500/20' 
                        : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                >
                    <Sparkles size={12} className={useMagicEnhance ? "text-yellow-300 fill-yellow-300" : ""} />
                    Magic Enhancer {useMagicEnhance ? 'ON' : 'OFF'}
                </button>
             </div>

             <div className="space-y-4">
                {/* Extra Tags */}
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Etiquetas extra (Inglés)</label>
                    <input 
                    type="text"
                    value={extraTags}
                    onChange={(e) => setExtraTags(e.target.value)}
                    placeholder="volumetric fog, highly detailed, slow motion..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                    />
                </div>

                {/* Negative Prompt */}
                <div>
                    <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <Ban size={10} /> Prompt Negativo (Lo que NO quieres)
                    </label>
                    <div className="relative">
                        <input 
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="Ej: Texto, marca de agua, borroso, deforme..."
                        className="w-full bg-slate-900/50 border border-red-900/30 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-900/50 outline-none placeholder:text-slate-600 text-slate-300"
                        />
                        {translatedNegative && translatedNegative !== negativePrompt && (
                            <div className="absolute right-3 top-3.5 text-xs text-slate-500 italic flex items-center gap-1 opacity-50">
                                <Globe size={10} /> {translatedNegative.substring(0, 20)}...
                            </div>
                        )}
                    </div>
                </div>
             </div>
          </section>
        </div>

        {/* Right Column: Output & History (Span 4) */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          
          {/* Output Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/50 rounded-xl p-6 shadow-2xl relative ring-1 ring-white/10 flex flex-col h-full max-h-[500px]">
            <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
               <Globe className="w-24 h-24" />
            </div>
            
            <h3 className="text-indigo-300 text-sm font-semibold mb-3 flex justify-between items-center relative z-10">
              <span>PROMPT FINAL (EN)</span>
            </h3>
            
            <div className="bg-black/40 rounded-lg p-4 flex-grow overflow-y-auto custom-scrollbar text-sm leading-relaxed text-indigo-50 font-mono border border-white/5 break-words relative z-10 shadow-inner">
              {isTranslating ? (
                <div className="flex items-center justify-center h-full gap-2 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Optimizando...</span>
                </div>
              ) : (
                <>
                    <p>{finalPrompt}</p>
                    {finalNegative && (
                        <p className="mt-4 text-red-200/70 text-xs border-t border-white/10 pt-2">
                            <span className="font-bold text-red-400">--no </span> {finalNegative}
                        </p>
                    )}
                    {!finalPrompt && <span className="text-slate-600 italic">Tu prompt aparecerá aquí...</span>}
                </>
              )}
            </div>

            <button 
              onClick={handleCopy}
              disabled={!finalPrompt || isTranslating}
              className={`mt-4 w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all relative z-10 shadow-lg ${
                copied 
                  ? 'bg-green-600 text-white scale-[0.98]' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {copied ? <RefreshCw className="animate-spin w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copiado' : 'Copiar Prompt'}
            </button>
          </div>

          {/* History Panel */}
          <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-slate-400 text-sm font-semibold flex items-center gap-2">
                <History className="w-4 h-4" /> Historial
              </h3>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                  <Trash2 size={12}/> Borrar
                </button>
              )}
            </div>
           
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">Vacío</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="group bg-slate-900/50 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
                    <p className="text-[10px] text-slate-400 line-clamp-2 font-mono mb-2 leading-relaxed">{h}</p>
                    <button 
                      onClick={() => {
                          const onSuccess = () => {
                            setCopied(true);
                            setShowDonateModal(true);
                            setTimeout(() => setCopied(false), 2000);
                          };
                          
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(h).then(onSuccess);
                          } else {
                            if (legacyCopy(h)) onSuccess();
                          }
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium uppercase tracking-wide"
                    >
                      Copiar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <AdPlaceholder />

        </div>
      </main>

      {/* --- MODALS --- */}

      {/* 1. TUTORIAL MODAL */}
      {showTutorial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                {/* Progress Bar */}
                <div className="h-1 bg-slate-800 w-full">
                    <div 
                        className="h-full bg-indigo-500 transition-all duration-300" 
                        style={{ width: `${((tutorialStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                    />
                </div>

                <div className="p-8 text-center flex flex-col items-center flex-grow">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                        {TUTORIAL_STEPS[tutorialStep].icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">
                        {TUTORIAL_STEPS[tutorialStep].title}
                    </h3>
                    
                    <p className="text-slate-300 text-base leading-relaxed mb-6">
                        {TUTORIAL_STEPS[tutorialStep].desc}
                    </p>
                </div>

                <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center">
                    <button 
                        onClick={closeTutorial}
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Saltar intro
                    </button>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={prevTutorialStep}
                            disabled={tutorialStep === 0}
                            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        
                        <button 
                            onClick={nextTutorialStep}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2"
                        >
                            {tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Empezar' : 'Siguiente'}
                            {tutorialStep === TUTORIAL_STEPS.length - 1 ? <CheckCircle2 size={18}/> : <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 2. DONATION MODAL */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setShowDonateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-2 border border-indigo-500/20">
                <Coffee size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-white">¡Gracias por usar la app!</h3>
              
              <p className="text-slate-300 text-sm leading-relaxed">
                Si te ayuda en tu trabajo diario, considera invitarme un café. Ayudas a mantener esto libre de anuncios molestos.
              </p>

              <div className="w-full pt-2 space-y-3">
                <button 
                   onClick={() => window.open('http://link.mercadopago.com.mx/acaapp', '_blank')}
                   className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                >
                  <Coffee size={18} />
                  Invitar un café (MercadoPago)
                </button>
                
                <button 
                  onClick={() => setShowDonateModal(false)}
                  className="w-full bg-transparent hover:bg-slate-800 text-slate-400 font-medium py-3 rounded-xl transition-colors text-sm"
                >
                  En la siguiente ocasión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- Subcomponent: Select Dropdown ---

const SelectGroup = ({ label, icon, value, setValue, options }: any) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
      {icon} {label}
    </label>
    <div className="relative">
      <select 
        value={options.find((o: any) => o.tag === value)?.tag || value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg p-2.5 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer hover:bg-slate-800 truncate"
      >
        {options.map((opt: any) => (
          <option key={opt.id} value={opt.tag}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
      </div>
    </div>
  </div>
);