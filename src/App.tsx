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
  Accessibility,
  Volume2,
  Moon,
  Sun,
  Zap,
  ZapOff,
  Palette,
  Search,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---
interface AppData {
  id: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function App() {
  // --- Accessibility States ---
  const [fontSize, setFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('launcher_fontSize') || '24');
  });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('launcher_darkMode') === 'true');
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('launcher_reduceMotion') === 'true');
  const [colorblindMode, setColorblindMode] = useState(() => localStorage.getItem('launcher_colorblindMode') === 'true');
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- Core States ---
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [dwellEnabled, setDwellEnabled] = useState(true);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });

  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dwellProgressRef = useRef(0);

  // --- Animation Refs ---
  const cursorX = useSpring(useMotionValue(50), { 
    stiffness: reduceMotion ? 1000 : 450, 
    damping: reduceMotion ? 100 : 35 
  });
  const cursorY = useSpring(useMotionValue(50), { 
    stiffness: reduceMotion ? 1000 : 450, 
    damping: reduceMotion ? 100 : 35 
  });

  // --- Utilities ---
  const triggerHaptic = (pattern: number[]) => {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAction = (label: string, url: string) => {
    triggerHaptic([50, 30, 50]);
    speak(`Abrindo ${label}`);
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  };

  const apps: AppData[] = [
    { 
      id: 'app-phone', 
      label: 'TELEFONE', 
      color: 'bg-[#22c55e]', 
      icon: <Phone size={56} strokeWidth={3} />,
      action: () => handleAction('Telefone', 'tel:')
    },
    { 
      id: 'app-whatsapp', 
      label: 'WHATSAPP', 
      color: 'bg-[#059669]', 
      icon: <MessageSquare size={56} strokeWidth={3} />,
      action: () => handleAction('WhatsApp', 'https://wa.me/')
    },
    { 
      id: 'app-emergency', 
      label: 'EMERGÊNCIA', 
      color: 'bg-[#ef4444]', 
      icon: <AlertCircle size={56} strokeWidth={3} />,
      action: () => handleAction('Emergência', 'tel:192')
    },
    { 
      id: 'app-family', 
      label: 'FAMÍLIA', 
      color: 'bg-[#a855f7]', 
      icon: <Home size={56} strokeWidth={3} />,
      action: () => handleAction('Família', 'tel:')
    },
  ];

  const handleClick = useCallback(() => {
    setIsClicking(true);
    triggerHaptic([60]);
    setTimeout(() => setIsClicking(false), 200);

    const headerHeight = 80;
    const navHeight = 96;
    const controlsHeight = window.innerHeight * 0.35;
    const mainAreaHeight = window.innerHeight - headerHeight - navHeight - controlsHeight;
    
    const xPx = (cursorPos.x / 100) * window.innerWidth;
    const yPx = (cursorPos.y / 100) * mainAreaHeight + headerHeight;
    const el = document.elementFromPoint(xPx, yPx);
    
    if (el) {
      const target = el.closest('button') || el.closest('a');
      if (target) (target as HTMLElement).click();
    }
  }, [cursorPos]);

  const handleTrackpadMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const isTouch = 'touches' in e;
    const touch = isTouch ? e.touches[0] : (e as React.MouseEvent);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    setCursorPos({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  }, []);

  useEffect(() => {
    cursorX.set(cursorPos.x);
    cursorY.set(cursorPos.y);

    const headerHeight = 80;
    const navHeight = 96;
    const controlsHeight = window.innerHeight * 0.35;
    const mainAreaHeight = window.innerHeight - headerHeight - navHeight - controlsHeight;
    
    const xPx = (cursorPos.x / 100) * window.innerWidth;
    const yPx = (cursorPos.y / 100) * mainAreaHeight + headerHeight;
    const el = document.elementFromPoint(xPx, yPx);
    const target = el?.closest('button') || el?.closest('a');
    const elementId = target?.id || null;

    if (elementId && elementId !== hoveredId && !elementId.includes('tracks')) {
      setHoveredId(elementId);
      triggerHaptic([10]);
    } else if (!elementId && hoveredId) {
      setHoveredId(null);
    }

    if (dwellEnabled && elementId && !elementId.includes('tracks') && !elementId.includes('mic')) {
      if (dwellTimerRef.current && hoveredId === elementId) return;
      if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);

      dwellProgressRef.current = 0;
      setDwellProgress(0);
      dwellTimerRef.current = setInterval(() => {
        dwellProgressRef.current += 5;
        setDwellProgress(dwellProgressRef.current);
        if (dwellProgressRef.current >= 100) {
          handleClick();
          clearInterval(dwellTimerRef.current!);
          dwellTimerRef.current = null;
          dwellProgressRef.current = 0;
          setDwellProgress(0);
        }
      }, 75);
    } else {
      if (dwellTimerRef.current) {
        clearInterval(dwellTimerRef.current);
        dwellTimerRef.current = null;
        setDwellProgress(0);
      }
    }
  }, [cursorPos, dwellEnabled, hoveredId, handleClick, cursorX, cursorY]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('launcher_darkMode', (!isDarkMode).toString());
    triggerHaptic([30, 30]);
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(16, Math.min(48, fontSize + delta));
    setFontSize(newSize);
    localStorage.setItem('launcher_fontSize', newSize.toString());
    triggerHaptic([20]);
  };

  const toggleReduceMotion = () => {
    setReduceMotion(!reduceMotion);
    localStorage.setItem('launcher_reduceMotion', (!reduceMotion).toString());
    triggerHaptic([30]);
  };

  const toggleColorblindMode = () => {
    setColorblindMode(!colorblindMode);
    localStorage.setItem('launcher_colorblindMode', (!colorblindMode).toString());
    triggerHaptic([30]);
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 h-[100dvh] flex flex-col overflow-hidden select-none transition-colors duration-500 font-sans safe-top safe-bottom",
        isDarkMode ? "bg-black" : "bg-[#e5e7eb]",
        colorblindMode && "grayscale contrast-125"
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Header */}
      <header className={cn(
        "h-20 border-b-[4px] flex items-center justify-between px-6 z-[100]",
        isDarkMode ? "bg-zinc-900 border-white/20 text-white" : "bg-white border-black text-black"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            id="access-btn"
            onClick={() => { setShowAccessModal(true); triggerHaptic([50]); }}
            className="w-12 h-12 flex-shrink-0 bg-yellow-400 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <Accessibility size={28} strokeWidth={3} className="text-black" />
          </button>
          <h1 className="font-black italic text-xl sm:text-2xl tracking-tighter uppercase leading-none truncate">
            ACESSO LIVRE
          </h1>
        </div>
        <button 
          id="settings-btn"
          onClick={() => triggerHaptic([50])}
          className={cn(
            "w-14 h-14 rounded-2xl border-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all",
            isDarkMode ? "bg-zinc-800 border-white text-white shadow-white/20" : "bg-white border-black"
          )}
        >
          <Settings size={32} strokeWidth={2.5} />
        </button>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 p-6 z-10 overflow-hidden">
        <motion.div 
          animate={{ scale: zoomScale, x: panPos.x, y: panPos.y }}
          className="grid grid-cols-2 gap-6 h-full"
        >
          {apps.map(app => (
            <button
              key={app.id}
              id={app.id}
              onClick={app.action}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-[40px] border-[4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all h-full aspect-square max-h-56 mx-auto w-full",
                app.color,
                isDarkMode ? "border-white shadow-white/10" : "border-black",
                hoveredId === app.id ? "scale-[1.05] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" : "scale-100"
              )}
            >
              <div className="text-black mt-2">
                {app.icon}
              </div>
              <span className="font-black text-lg sm:text-xl tracking-tight uppercase text-black mb-2 px-2">
                {app.label}
              </span>
              <div className="absolute top-6 right-6 w-10 h-10 bg-[#ef4444] rounded-full border-[3px] border-black flex items-center justify-center shadow-sm">
                <X size={24} strokeWidth={4} className="text-white" />
              </div>
            </button>
          ))}
        </motion.div>
      </main>

      {/* Nav Bar */}
      <nav className={cn(
        "h-24 border-y-[4px] grid grid-cols-4 z-[100]",
        isDarkMode ? "bg-zinc-900 border-white/20 text-white" : "bg-white border-black text-black"
      )}>
        {[
          { id: 'nav-back', label: 'VOLTAR', icon: <ArrowLeft size={36} /> },
          { id: 'nav-help', label: 'AJUDA', icon: <Search size={36} /> },
          { id: 'nav-home', label: 'INÍCIO', icon: <Home size={36} /> },
          { id: 'nav-menu', label: 'MENU', icon: <Menu size={36} /> },
        ].map(item => (
          <button
            key={item.id}
            id={item.id}
            className={cn(
              "flex flex-col items-center justify-center border-r-[2px] last:border-r-0 active:bg-gray-100 transition-colors",
              isDarkMode ? "border-white/10 active:bg-zinc-800" : "border-black active:bg-gray-100"
            )}
          >
            {item.icon}
            <span className="font-black text-xs mt-1 uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Assistive Controls Section */}
      <div className={cn(
        "h-[35%] grid grid-cols-[110px_1fr_110px] border-b-[4px] z-[100]",
        isDarkMode ? "bg-black border-white/20" : "bg-[#e5e7eb] border-black"
      )}>
        {/* Mic Side */}
        <div className={cn("border-r-[4px] flex items-center justify-center", isDarkMode ? "bg-zinc-900 border-white/20" : "bg-white border-black")}>
          <button 
            id="mic-btn"
            onClick={() => { setIsVoiceActive(!isVoiceActive); triggerHaptic([50]); }}
            className={cn(
              "w-20 h-20 rounded-full border-[4px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all",
              isVoiceActive ? "bg-red-400 border-black" : (isDarkMode ? "bg-zinc-800 border-white text-white" : "bg-white border-black")
            )}
          >
            {isVoiceActive ? <Mic size={40} /> : <MicOff size={40} />}
          </button>
        </div>

        {/* Trackpad Area */}
        <div 
          id="tracks-area"
          className={cn(
            "relative overflow-hidden active:bg-gray-200 transition-colors flex items-center justify-center",
            isDarkMode ? "bg-zinc-900 active:bg-zinc-800" : "bg-[#f3f4f6]"
          )}
          onMouseMove={handleTrackpadMove}
          onTouchMove={handleTrackpadMove}
          onClick={handleClick}
        >
          <span className={cn(
            "font-black text-xl sm:text-2xl tracking-[0.3em] pointer-events-none uppercase text-center px-4",
            isDarkMode ? "text-white/10" : "text-gray-300"
          )}>
            TRACKPAD
          </span>
          {dwellEnabled && dwellProgress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-48 h-48 rotate-[-90deg]">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="10"
                  strokeDasharray="552"
                  strokeDashoffset={552 - (552 * dwellProgress) / 100}
                  className="transition-all duration-75"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Zoom Side */}
        <div className={cn("border-l-[4px] flex flex-col", isDarkMode ? "bg-zinc-900 border-white/20" : "bg-white border-black")}>
          <button 
            id="z-in"
            className={cn("flex-1 border-b-[2px] flex items-center justify-center active:bg-gray-100", isDarkMode ? "border-white/10" : "border-black")}
            onClick={() => { setZoomScale(s => Math.min(s + 0.2, 3)); triggerHaptic([30]); }}
          >
            <ZoomIn size={44} strokeWidth={3} />
          </button>
          <button 
            id="z-out"
            className="flex-1 flex items-center justify-center active:bg-gray-100"
            onClick={() => { setZoomScale(s => Math.max(s - 0.2, 0.5)); triggerHaptic([30]); }}
          >
            <ZoomOut size={44} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Visual Cursor */}
      <motion.div
        className="fixed pointer-events-none z-[500]"
        style={{
          left: cursorX.get() + 'vw',
          top: `calc(${80}px + ${cursorY.get()}% * (100vh - 80px - 96px - 35vh))`,
          x: "-50%",
          y: "-50%"
        }}
        animate={{ scale: isClicking ? 0.8 : 1 }}
      >
        <svg viewBox="0 0 100 100" className="w-[80px] h-[80px] drop-shadow-2xl transform rotate-[-45deg]">
          <path 
            d="M10,10 L90,50 L50,55 L45,90 Z" 
            fill={isDarkMode ? "#fff" : "#facc15"} 
            stroke="black" 
            strokeWidth="10" 
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Accessibility Modal */}
      <AnimatePresence>
        {showAccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className={cn(
                "w-full max-w-2xl rounded-[48px] border-[6px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden",
                isDarkMode ? "bg-zinc-800 border-white text-white" : "bg-white border-black text-black"
              )}
            >
              <div className="bg-yellow-400 p-8 border-b-[6px] border-black flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Accessibility size={56} strokeWidth={3} className="text-black" />
                  <h2 className="font-black text-4xl uppercase italic text-black">Acessibilidade</h2>
                </div>
                <button onClick={() => setShowAccessModal(false)} className="bg-white p-4 rounded-3xl border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <X size={40} strokeWidth={4} className="text-black" />
                </button>
              </div>
              
              <div className="p-8 grid grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
                <button 
                  onClick={() => adjustFontSize(4)}
                  className="h-32 rounded-3xl border-[4px] border-black bg-blue-400 flex flex-col items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  <ZoomIn size={48} strokeWidth={4} className="text-black" />
                  <span className="font-black uppercase text-xl text-black">Aumentar Texto</span>
                </button>
                <button 
                  onClick={() => adjustFontSize(-4)}
                  className="h-32 rounded-3xl border-[4px] border-black bg-green-400 flex flex-col items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  <ZoomOut size={48} strokeWidth={4} className="text-black" />
                  <span className="font-black uppercase text-xl text-black">Diminuir Texto</span>
                </button>
                <button 
                  onClick={toggleDarkMode}
                  className={cn(
                    "h-32 rounded-3xl border-[4px] border-black flex flex-col items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all",
                    isDarkMode ? "bg-zinc-600 text-white" : "bg-zinc-200 text-black"
                  )}
                >
                  {isDarkMode ? <Sun size={48} strokeWidth={4} /> : <Moon size={48} strokeWidth={4} />}
                  <span className="font-black uppercase text-xl">{isDarkMode ? "Modo Claro" : "Modo Escuro"}</span>
                </button>
                <button 
                  onClick={() => speak("Tela sendo lida agora para auxiliar na navegação.")}
                  className="h-32 rounded-3xl border-[4px] border-black bg-orange-400 flex flex-col items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  <Volume2 size={48} strokeWidth={4} className="text-black" />
                  <span className="font-black uppercase text-xl text-black">Ler Tela</span>
                </button>
                <button 
                  onClick={toggleReduceMotion}
                  className={cn(
                    "h-32 rounded-3xl border-[4px] border-black flex flex-col items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all",
                    reduceMotion ? "bg-purple-400 text-black" : "bg-gray-100 text-black"
                  )}
                >
                  {reduceMotion ? <ZapOff size={48} strokeWidth={4} /> : <Zap size={48} strokeWidth={4} />}
                  <span className="font-black uppercase text-xl">{reduceMotion ? "Menu Estático" : "Animações"}</span>
                </button>
                <button 
                  onClick={toggleColorblindMode}
                  className={cn(
                    "h-32 rounded-3xl border-[4px] border-black flex flex-col items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all",
                    colorblindMode ? "bg-yellow-200 text-black" : "bg-white text-black"
                  )}
                >
                  <Palette size={48} strokeWidth={4} className="text-black" />
                  <span className="font-black uppercase text-xl text-black">Daltônicos</span>
                </button>
              </div>

              <div className="p-8 bg-gray-100 border-t-[6px] border-black">
                <button 
                  onClick={() => setShowAccessModal(false)}
                  className="w-full h-24 bg-[#ef4444] text-white rounded-[32px] border-[4px] border-black font-black uppercase text-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  FECHAR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
