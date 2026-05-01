import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { 
  MousePointer2, 
  Home, 
  ArrowLeft, 
  Menu, 
  Phone, 
  MessageSquare, 
  Mic, 
  MicOff,
  Settings,
  X,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Volume2,
  ZapOff,
  Search,
  Moon,
  Sun,
  LogOut,
  LogIn
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---
interface AppData {
  id: string;
  label: string;
  color: string;
  createdAt: number;
}

interface CursorPos {
  x: number;
  y: number;
}

const translations = {
  pt: {
    title: "Acesso Livre",
    settings: "Configurações",
    done: "CONCLUIR",
    back: "VOLTAR",
    help: "AJUDA",
    home: "INÍCIO",
    menu: "MENU",
    trackpad: "TRACKPAD",
    dwellOn: "CLIQUE AUTOMÁTICO ON",
    dwellOff: "CLIQUE AUTOMÁTICO OFF",
    assistiveOn: "MODO ASSISTIVO ON",
    assistiveOff: "MODO ASSISTIVO OFF",
  },
  en: {
    title: "Free Access",
    settings: "Settings",
    done: "DONE",
    back: "BACK",
    help: "HELP",
    home: "HOME",
    menu: "MENU",
    trackpad: "TRACKPAD",
    dwellOn: "AUTOCLICK ON",
    dwellOff: "AUTOCLICK OFF",
    assistiveOn: "ASSISTIVE MODE ON",
    assistiveOff: "ASSISTIVE MODE OFF",
  },
  es: {
    title: "Acceso Libre",
    settings: "Ajustes",
    done: "HECHO",
    back: "VOLVER",
    help: "AYUDA",
    home: "INICIO",
    menu: "MENÚ",
    trackpad: "TRACKPAD",
    dwellOn: "AUTOCLIC ON",
    dwellOff: "AUTOCLIC OFF",
    assistiveOn: "MODO ASISTIVO ON",
    assistiveOff: "MODO ASISTIVO OFF",
  }
};

export default function App() {
  const [lang, setLang] = useState<'pt' | 'en' | 'es'>(() => {
    return (localStorage.getItem('launcher_lang') as 'pt' | 'en' | 'es') || 'pt';
  });
  const t = translations[lang];

  const [cursorPos, setCursorPos] = useState<CursorPos>({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('launcher_highContrast') === 'true');
  const [dwellEnabled, setDwellEnabled] = useState(() => localStorage.getItem('launcher_dwellEnabled') !== 'false');
  const [isAssistiveMode, setIsAssistiveMode] = useState(() => localStorage.getItem('launcher_assistiveMode') !== 'false');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('launcher_darkMode') === 'true');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dwellProgressRef = useRef(0);

  const cursorX = useSpring(useMotionValue(50), { stiffness: 450, damping: 35 });
  const cursorY = useSpring(useMotionValue(50), { stiffness: 450, damping: 35 });

  const [apps] = useState<AppData[]>([
    { id: 'app-phone', label: lang === 'pt' ? 'TELEFONE' : 'PHONE', color: 'bg-[#22c55e]', createdAt: Date.now() },
    { id: 'app-whatsapp', label: 'WHATSAPP', color: 'bg-[#059669]', createdAt: Date.now() + 1 },
    { id: 'app-emergency', label: lang === 'pt' ? 'EMERGÊNCIA' : 'EMERGENCY', color: 'bg-[#ef4444]', createdAt: Date.now() + 2 },
    { id: 'app-family', label: lang === 'pt' ? 'FAMÍLIA' : 'FAMILY', color: 'bg-[#a855f7]', createdAt: Date.now() + 3 },
  ]);

  const triggerHaptic = (pattern: number[]) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const saveSettings = (k: string, v: any) => localStorage.setItem(`launcher_${k}`, String(v));

  const handleClick = useCallback(() => {
    setIsClicking(true);
    triggerHaptic([50]);
    setTimeout(() => setIsClicking(false), 200);

    const xPx = (cursorPos.x / 100) * window.innerWidth;
    const headerHeight = 80;
    const navHeight = 96;
    const controlsHeight = window.innerHeight * 0.3;
    const mainAreaHeight = window.innerHeight - headerHeight - navHeight - controlsHeight;
    
    const yPx = (cursorPos.y / 100) * mainAreaHeight + headerHeight;
    const el = document.elementFromPoint(xPx, yPx);
    if (el) {
      const target = el.closest('button') || el.closest('a');
      if (target) (target as HTMLElement).click();
    }
  }, [cursorPos]);

  useEffect(() => {
    cursorX.set(cursorPos.x);
    cursorY.set(cursorPos.y);

    const headerHeight = 80;
    const navHeight = 96;
    const controlsHeight = window.innerHeight * 0.3;
    const mainAreaHeight = window.innerHeight - headerHeight - navHeight - controlsHeight;
    
    const xPx = (cursorPos.x / 100) * window.innerWidth;
    const yPx = (cursorPos.y / 100) * mainAreaHeight + headerHeight;
    const el = document.elementFromPoint(xPx, yPx);
    const target = el?.closest('button') || el?.closest('a');
    const elementId = target?.id || null;

    if (elementId && elementId !== hoveredId && !elementId.includes('trackpad')) {
      setHoveredId(elementId);
      triggerHaptic([15]);
    } else if (!elementId && hoveredId) {
      setHoveredId(null);
    }

    if (dwellEnabled && elementId && !elementId.includes('trackpad') && !elementId.includes('mic')) {
      if (dwellTimerRef.current && hoveredId === elementId) return;
      if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);

      dwellProgressRef.current = 0;
      setDwellProgress(0);
      dwellTimerRef.current = setInterval(() => {
        dwellProgressRef.current += 4;
        setDwellProgress(dwellProgressRef.current);
        if (dwellProgressRef.current >= 100) {
          handleClick();
          clearInterval(dwellTimerRef.current!);
          dwellTimerRef.current = null;
          dwellProgressRef.current = 0;
          setDwellProgress(0);
        }
      }, 60);
    } else {
      if (dwellTimerRef.current) {
        clearInterval(dwellTimerRef.current);
        dwellTimerRef.current = null;
        setDwellProgress(0);
      }
    }
  }, [cursorPos, dwellEnabled, hoveredId, handleClick, cursorX, cursorY]);

  return (
    <div className={cn(
      "fixed inset-0 h-[100dvh] flex flex-col bg-[#e5e7eb] font-sans transition-colors duration-500",
      isDarkMode && "bg-zinc-950",
      highContrast && "bg-black"
    )}>
      {/* Header */}
      <header className={cn(
        "h-20 bg-white border-b-[4px] border-black flex items-center justify-between px-6 z-[60]",
        isDarkMode && "bg-zinc-900 border-zinc-700",
        highContrast && "bg-black border-white"
      )}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400 rounded-full border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <MousePointer2 className="rotate-45 fill-black" size={24} />
          </div>
          <h1 className={cn("font-black italic text-2xl tracking-tighter text-gray-900 uppercase", (isDarkMode || highContrast) && "text-white")}>ACESSO LIVRE</h1>
        </div>
        <button id="settings-btn" onClick={() => setShowSettings(true)} className={cn("w-14 h-14 bg-white border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all", (isDarkMode || highContrast) && "bg-zinc-800 border-white text-white")}>
          <Settings size={32} strokeWidth={2.5} />
        </button>
      </header>

      {/* Grid Area */}
      <main className="flex-1 p-6 relative overflow-hidden z-10">
        <motion.div animate={{ scale: zoomScale, x: panPos.x, y: panPos.y }} className="grid grid-cols-2 gap-6 h-full">
          {apps.map(app => (
            <button key={app.id} id={app.id} className={cn(
              "relative flex flex-col items-center justify-center gap-4 rounded-[40px] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all",
              app.color,
              hoveredId === app.id && "scale-105 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
              highContrast && "bg-black text-white border-white",
              isDarkMode && !app.color.includes('bg-') && "bg-zinc-800 text-white"
            )}>
              {app.id === 'app-phone' && <Phone size={64} strokeWidth={2.5} />}
              {app.id === 'app-whatsapp' && <MessageSquare size={64} strokeWidth={2.5} />}
              {app.id === 'app-emergency' && <Plus size={64} strokeWidth={2.5} />}
              {app.id === 'app-family' && <Home size={64} strokeWidth={2.5} />}
              <span className="font-black text-xl tracking-tight uppercase">{app.label}</span>
              <div className="absolute top-4 right-4 w-8 h-8 bg-[#ef4444] rounded-full border-[3px] border-black flex items-center justify-center">
                <X size={18} strokeWidth={4} className="text-white" />
              </div>
            </button>
          ))}
        </motion.div>
      </main>

      {/* Nav Buttons */}
      <nav className={cn(
        "h-24 bg-white border-y-[4px] border-black grid grid-cols-4 z-40",
        isDarkMode && "bg-zinc-900 border-zinc-700",
        highContrast && "bg-black border-white"
      )}>
        {[
          { id: 'nav-back', label: t.back, icon: <ArrowLeft size={32} /> },
          { id: 'nav-help', label: t.help, icon: <Search size={32} /> },
          { id: 'nav-home', label: t.home, icon: <Home size={32} /> },
          { id: 'nav-menu', label: t.menu, icon: <Menu size={32} /> },
        ].map(item => (
          <button key={item.id} id={item.id} className={cn("flex flex-col items-center justify-center border-r-[2px] last:border-r-0 border-black active:bg-gray-100 uppercase", (isDarkMode || highContrast) && "text-white hover:bg-zinc-800 border-zinc-700")}>
            {item.icon}
            <span className="font-black text-[10px] mt-1 tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Assistive controls */}
      <div className={cn(
        "h-[30%] bg-white grid grid-cols-[110px_1fr_110px] z-40 border-black",
        isDarkMode && "bg-zinc-900",
        highContrast && "bg-black border-white"
      )}>
        <div className={cn("border-r-[4px] border-black flex items-center justify-center p-4", highContrast && "border-white")}>
          <button id="mic-btn" onClick={() => setIsVoiceActive(!isVoiceActive)} className={cn("w-16 h-16 rounded-full border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors", isVoiceActive ? "bg-red-400 text-black" : "bg-white", (isDarkMode || highContrast) && "bg-zinc-800 border-white text-white")}>
            {isVoiceActive ? <Mic size={32} /> : <MicOff size={32} />}
          </button>
        </div>
        <div id="trackpad-main" 
          onMouseMove={(e) => { 
            const rect = e.currentTarget.getBoundingClientRect(); 
            setCursorPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }) 
          }} 
          onTouchMove={(e) => { 
            const rect = e.currentTarget.getBoundingClientRect(); 
            const t = e.touches[0]; 
            setCursorPos({ x: ((t.clientX - rect.left) / rect.width) * 100, y: ((t.clientY - rect.top) / rect.height) * 100 }) 
          }} 
          onClick={handleClick} 
          className={cn("relative bg-[#f3f4f6] flex items-center justify-center overflow-hidden", isDarkMode && "bg-zinc-800", highContrast && "bg-black")}
        >
          <span className="font-black text-gray-400 opacity-40 tracking-[0.3em] pointer-events-none uppercase">{t.trackpad}</span>
          {dwellEnabled && dwellProgress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-32 h-32 -rotate-90">
                <circle cx="64" cy="64" r="58" fill="none" stroke="#facc15" strokeWidth="8" strokeDasharray="364" strokeDashoffset={364 - (364 * dwellProgress) / 100} className="transition-all" />
              </svg>
            </div>
          )}
        </div>
        <div className={cn("border-l-[4px] border-black flex flex-col bg-white", isDarkMode && "bg-zinc-900 border-zinc-700", highContrast && "bg-black border-white")}>
          <button id="z-in" onClick={() => setZoomScale(s => Math.min(s + 0.2, 3))} className={cn("flex-1 flex items-center justify-center border-b-[2px] border-black active:bg-gray-100", (isDarkMode || highContrast) && "text-white hover:bg-zinc-800 border-zinc-700")}>
            <ZoomIn size={32} strokeWidth={2.5} />
          </button>
          <button id="z-out" onClick={() => setZoomScale(s => Math.max(s - 0.2, 0.5))} className={cn("flex-1 flex items-center justify-center active:bg-gray-100", (isDarkMode || highContrast) && "text-white hover:bg-zinc-800 border-zinc-700")}>
            <ZoomOut size={32} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Visual Cursor */}
      <motion.div className="fixed pointer-events-none z-[1000]" style={{ left: cursorX.get() + 'vw', top: `calc(80px + ${cursorY.get()}% * (100vh - 80px - 96px - 30vh))`, x: "-50%", y: "-50%" }}>
        <svg viewBox="0 0 100 100" className="w-[60px] h-[60px] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-[45deg]">
          <path d="M10,10 L90,50 L50,55 L45,90 Z" fill={highContrast ? "white" : "#facc15"} stroke="black" strokeWidth="8" strokeLinejoin="round" />
        </svg>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className={cn("bg-white border-[4px] border-black w-full max-w-md rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden", isDarkMode && "bg-zinc-900 border-zinc-700", highContrast && "bg-black border-white")}>
              <div className="bg-yellow-400 p-6 border-b-[4px] border-black flex justify-between items-center">
                <span className="font-black text-2xl uppercase italic">{t.settings}</span>
                <button onClick={() => setShowSettings(false)} className="bg-white p-2 rounded-xl border-[4px] border-black active:translate-y-1"><X size={24} strokeWidth={3} /></button>
              </div>
              <div className="p-8 flex flex-col gap-5">
                 <button onClick={() => { setDwellEnabled(!dwellEnabled); saveSettings('dwellEnabled', !dwellEnabled) }} className={cn("w-full h-18 border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg transition-colors", dwellEnabled ? 'bg-green-400 text-black' : 'bg-gray-100 text-black')}>
                    {dwellEnabled ? t.dwellOn : t.dwellOff}
                 </button>
                 <button onClick={() => { setHighContrast(!highContrast); saveSettings('highContrast', !highContrast) }} className={cn("w-full h-18 border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg transition-colors", highContrast ? 'bg-orange-400 text-black' : 'bg-gray-100 text-black')}>
                    ALTO CONTRASTE {highContrast ? "ON" : "OFF"}
                 </button>
                 <button onClick={() => { setIsDarkMode(!isDarkMode); saveSettings('darkMode', !isDarkMode) }} className={cn("w-full h-18 border-[4px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg transition-colors", isDarkMode ? 'bg-zinc-700 text-white' : 'bg-gray-100 text-black')}>
                    MODO ESCURO {isDarkMode ? "ON" : "OFF"}
                 </button>
                 <div className="grid grid-cols-3 gap-3">
                    {(['pt', 'en', 'es'] as const).map(l => (
                      <button key={l} onClick={() => { setLang(l); saveSettings('lang', l) }} className={cn("h-14 border-[4px] border-black rounded-xl font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", lang === l ? 'bg-yellow-400 text-black' : 'bg-white text-black')}>
                        {l.toUpperCase()}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="p-6 bg-gray-100 border-t-[4px] border-black flex gap-4">
                <button onClick={() => setShowSettings(false)} className="w-full py-5 bg-black text-white font-black rounded-2xl text-xl uppercase tracking-widest active:scale-95 transition-transform">{t.done}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
