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
  Search,
  Zap,
  ZapOff,
  Palette,
  Maximize2,
  Lock,
  Unlock,
  MapPin,
  Contrast,
  Smartphone,
  HelpCircle,
  Eye,
  Search as LupaIcon,
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
    return parseInt(localStorage.getItem('launcher_fontSize') || '22');
  });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('launcher_darkMode') === 'true');
  const [highContrastMode, setHighContrastMode] = useState(() => localStorage.getItem('launcher_highContrast') === 'true');
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('launcher_reduceMotion') === 'true');
  const [colorblindMode, setColorblindMode] = useState(() => localStorage.getItem('launcher_colorblindMode') === 'true');
  const [lockEdit, setLockEdit] = useState(() => localStorage.getItem('launcher_lockEdit') === 'true');
  const [vibrateOnTouch, setVibrateOnTouch] = useState(() => localStorage.getItem('launcher_vibrateOnTouch') !== 'false');
  const [showAccessModal, setShowAccessModal] = useState(false);
  
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

  // --- Animation Springs ---
  const cursorX = useSpring(useMotionValue(50), { 
    stiffness: reduceMotion ? 1500 : 450, 
    damping: reduceMotion ? 120 : 35 
  });
  const cursorY = useSpring(useMotionValue(50), { 
    stiffness: reduceMotion ? 1500 : 450, 
    damping: reduceMotion ? 120 : 35 
  });

  // --- Utilities ---
  const triggerHaptic = (pattern: number[]) => {
    if (vibrateOnTouch && 'vibrate' in navigator) navigator.vibrate(pattern);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleWhereAmI = () => {
    const text = "Você está na tela inicial do Acesso Livre. No centro estão seus aplicativos: Telefone, WhatsApp, Emergência e Família. Na base está o trackpad para controle via cursor.";
    speak(text);
    triggerHaptic([100, 50, 100]);
  };

  const apps: AppData[] = [
    { 
      id: 'app-phone', 
      label: 'TELEFONE', 
      color: 'bg-[#22c55e]', 
      icon: <Phone size={52} strokeWidth={3} />,
      action: () => { window.location.href = 'tel:'; speak("Abrindo Telefone"); }
    },
    { 
      id: 'app-whatsapp', 
      label: 'WHATSAPP', 
      color: 'bg-[#059669]', 
      icon: <MessageSquare size={52} strokeWidth={3} />,
      action: () => { 
        window.location.href = 'https://wa.me/'; 
        speak("Abrindo WhatsApp"); 
      }
    },
    { 
      id: 'app-emergency', 
      label: 'EMERGÊNCIA', 
      color: 'bg-[#ef4444]', 
      icon: <AlertCircle size={52} strokeWidth={3} />,
      action: () => { window.location.href = 'tel:192'; speak("LIGANDO PARA EMERGÊNCIA"); }
    },
    { 
      id: 'app-family', 
      label: 'FAMÍLIA', 
      color: 'bg-[#a855f7]', 
      icon: <Home size={52} strokeWidth={3} />,
      action: () => { speak("Abrindo contatos da família"); }
    },
  ];

  const handleClick = useCallback(() => {
    setIsClicking(true);
    triggerHaptic([60]);
    setTimeout(() => setIsClicking(false), 200);

    const xPx = (cursorPos.x / 100) * window.innerWidth;
    const headerHeight = 80;
    const navHeight = 96;
    const controlsHeight = window.innerHeight * 0.32;
    const mainAreaHeight = window.innerHeight - headerHeight - navHeight - controlsHeight;
    
    const yPxScrollAdjusted = (cursorPos.y / 100) * mainAreaHeight + headerHeight;
    const el = document.elementFromPoint(xPx, yPxScrollAdjusted);
    
    if (el) {
      const target = el.closest('button') || el.closest('a');
      if (target) (target as HTMLElement).click();
    }
  }, [cursorPos, vibrateOnTouch]);

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
    const controlsHeight = window.innerHeight * 0.32;
    const mainAreaHeight = window.innerHeight - headerHeight - navHeight - controlsHeight;
    
    const xPx = (cursorPos.x / 100) * window.innerWidth;
    const yPx = (cursorPos.y / 100) * mainAreaHeight + headerHeight;
    const el = document.elementFromPoint(xPx, yPx);
    const target = el?.closest('button') || el?.closest('a');
    const elementId = target?.id || null;

    if (elementId && elementId !== hoveredId && !elementId.includes('tracks')) {
      setHoveredId(elementId);
      if (vibrateOnTouch) triggerHaptic([10]);
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
  }, [cursorPos, dwellEnabled, hoveredId, handleClick, cursorX, cursorY, vibrateOnTouch]);

  return (
    <div 
      className={cn(
        "fixed inset-0 h-[100dvh] flex flex-col overflow-hidden select-none transition-all duration-500 font-sans safe-top safe-bottom",
        isDarkMode ? "bg-black" : "bg-[#e5e7eb]",
        colorblindMode && "grayscale contrast-125",
        highContrastMode && "!bg-black !text-white"
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Header */}
      <header className={cn(
        "h-20 flex-shrink-0 border-b-[4px] flex items-center justify-between px-6 z-[100]",
        isDarkMode || highContrastMode ? "bg-zinc-900 border-white text-white" : "bg-white border-black text-black"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            id="access-btn"
            onClick={() => { setShowAccessModal(true); triggerHaptic([50]); }}
            className={cn(
              "w-12 h-12 flex-shrink-0 mt-1 bg-yellow-400 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all",
              highContrastMode && "bg-white border-white shadow-white text-black"
            )}
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
            "w-12 h-12 rounded-2xl border-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all",
            isDarkMode || highContrastMode ? "bg-zinc-800 border-white text-white shadow-white/20" : "bg-white border-black"
          )}
        >
          <Settings size={28} strokeWidth={2.5} />
        </button>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 p-4 sm:p-6 overflow-hidden flex items-center justify-center z-10">
        <motion.div 
          animate={{ scale: zoomScale, x: panPos.x, y: panPos.y }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
          className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-lg aspect-square"
        >
          {apps.map(app => (
            <button
              key={app.id}
              id={app.id}
              onClick={app.action}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-[32px] sm:rounded-[48px] border-[4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all h-full w-full",
                highContrastMode ? "bg-black text-white border-white shadow-white/50" : app.color,
                isDarkMode ? "border-white shadow-white/10" : "border-black",
                hoveredId === app.id ? "scale-[1.05] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" : "scale-100"
              )}
            >
              <div className={cn(highContrastMode ? "text-white" : "text-black", "mt-1")}>
                {app.icon}
              </div>
              <span className={cn(
                "font-black text-sm sm:text-lg tracking-tight uppercase px-2 text-center leading-tight",
                highContrastMode ? "text-white" : "text-black"
              )}>
                {app.label}
              </span>
              {!lockEdit && (
                <div className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-[#ef4444] rounded-full border-[3px] border-black flex items-center justify-center shadow-sm">
                  <X size={20} strokeWidth={4} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </motion.div>
      </main>

      {/* Nav Bar */}
      <nav className={cn(
        "h-24 flex-shrink-0 border-y-[4px] grid grid-cols-4 z-[100]",
        isDarkMode || highContrastMode ? "bg-zinc-900 border-white text-white" : "bg-white border-black text-black"
      )}>
        {[
          { id: 'nav-back', label: 'VOLTAR', icon: <ArrowLeft size={32} /> },
          { id: 'nav-help', label: 'AJUDA', icon: <Search size={32} /> },
          { id: 'nav-home', label: 'INÍCIO', icon: <Home size={32} /> },
          { id: 'nav-menu', label: 'MENU', icon: <Menu size={32} /> },
        ].map(item => (
          <button
            key={item.id}
            id={item.id}
            className={cn(
              "flex flex-col items-center justify-center border-r-[2px] last:border-r-0 active:bg-gray-100 transition-colors uppercase",
              isDarkMode || highContrastMode ? "border-white/10 active:bg-zinc-800" : "border-black active:bg-gray-100"
            )}
          >
            {item.icon}
            <span className="font-black text-[10px] sm:text-xs mt-1 tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Assistive Controls Section */}
      <div className={cn(
        "h-[32%] flex-shrink-0 grid grid-cols-[110px_1fr_110px] border-b-[4px] z-[100]",
        isDarkMode || highContrastMode ? "bg-black border-white/20" : "bg-[#e5e7eb] border-black"
      )}>
        <div className={cn("border-r-[4px] flex items-center justify-center", isDarkMode || highContrastMode ? "bg-zinc-900 border-white" : "bg-white border-black")}>
          <button 
            id="mic-btn"
            onClick={() => { setIsVoiceActive(!isVoiceActive); triggerHaptic([50]); }}
            className={cn(
              "w-16 h-16 rounded-full border-[4px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all",
              isVoiceActive ? "bg-red-400 border-black" : (isDarkMode || highContrastMode ? "bg-zinc-800 border-white text-white shadow-white" : "bg-white border-black")
            )}
          >
            {isVoiceActive ? <Mic size={36} /> : <MicOff size={36} />}
          </button>
        </div>

        <div 
          id="tracks-area"
          className={cn(
            "relative overflow-hidden active:bg-gray-200 transition-colors flex items-center justify-center",
            isDarkMode || highContrastMode ? "bg-zinc-900 active:bg-zinc-800" : "bg-[#f3f4f6]"
          )}
          onMouseMove={handleTrackpadMove}
          onTouchMove={handleTrackpadMove}
          onClick={handleClick}
        >
          <span className={cn(
            "font-black text-xl sm:text-2xl tracking-[0.3em] pointer-events-none uppercase text-center px-4",
            isDarkMode || highContrastMode ? "text-white/10" : "text-gray-300"
          )}>
            TRACKPAD
          </span>
          {dwellEnabled && dwellProgress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-32 h-32 rotate-[-90deg]">
                <circle cx="64" cy="64" r="60" fill="none" stroke="#fbbf24" strokeWidth="8" strokeDasharray="377" strokeDashoffset={377 - (377 * dwellProgress) / 100} className="transition-all duration-75" />
              </svg>
            </div>
          )}
        </div>

        <div className={cn("border-l-[4px] flex flex-col", isDarkMode || highContrastMode ? "bg-zinc-900 border-white" : "bg-white border-black")}>
          <button id="z-in" className={cn("flex-1 border-b-[2px] flex items-center justify-center active:bg-gray-100", isDarkMode || highContrastMode ? "border-white/10" : "border-black")} onClick={() => { setZoomScale(s => Math.min(s + 0.2, 3)); triggerHaptic([30]); }}>
            <ZoomIn size={40} strokeWidth={3} />
          </button>
          <button id="z-out" className="flex-1 flex items-center justify-center active:bg-gray-100" onClick={() => { setZoomScale(s => Math.max(s - 0.2, 0.5)); triggerHaptic([30]); }}>
            <ZoomOut size={40} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Visual Cursor */}
      <motion.div
        className="fixed pointer-events-none z-[1000]"
        style={{
          left: cursorX.get() + 'vw',
          top: `calc(${80}px + ${cursorY.get()}% * (100vh - 80px - 96px - 32vh))`,
          x: "-50%",
          y: "-50%"
        }}
        animate={{ scale: isClicking ? 0.7 : 1 }}
      >
        <svg viewBox="0 0 100 100" className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] drop-shadow-2xl transform rotate-[-45deg]">
          <path d="M10,10 L90,50 L50,55 L45,90 Z" fill={highContrastMode || isDarkMode ? "#fff" : "#facc15"} stroke="black" strokeWidth="10" strokeLinejoin="round" />
        </svg>
      </motion.div>

      {/* Accessibility Modal */}
      <AnimatePresence>
        {showAccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className={cn("w-full max-w-2xl max-h-[90vh] rounded-[40px] border-[6px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden", isDarkMode || highContrastMode ? "bg-zinc-800 border-white text-white" : "bg-white border-black text-black")}>
              <div className="bg-yellow-400 p-6 sm:p-8 border-b-[6px] border-black flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <Accessibility size={48} strokeWidth={3} className="text-black" />
                  <h2 className="font-black text-xl sm:text-3xl uppercase italic text-black leading-tight">Configurações</h2>
                </div>
                <button onClick={() => setShowAccessModal(false)} className="bg-white p-3 rounded-2xl border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"><X size={32} strokeWidth={4} className="text-black" /></button>
              </div>
              
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8">
                {/* VISÃO */}
                <section>
                  <h3 className="font-black text-sm uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2"><Eye size={18}/> Visão</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setFontSize(s => Math.min(48, s + 4))} className="h-28 rounded-2xl border-[4px] border-black bg-blue-400 flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <ZoomIn size={32} className="text-black" />
                      <span className="font-black uppercase text-[10px] text-black">Aumentar Texto</span>
                    </button>
                    <button onClick={() => { setZoomScale(2); setPanPos({ x: 0, y: 0 }); triggerHaptic([30]); }} className="h-28 rounded-2xl border-[4px] border-black bg-cyan-400 flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">
                      <LupaIcon size={32} className="text-black" />
                      <span className="font-black uppercase text-[10px] text-black">Lupa</span>
                    </button>
                    <button onClick={() => { setHighContrastMode(!highContrastMode); triggerHaptic([50]); }} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", highContrastMode ? "bg-white text-black" : "bg-zinc-200 text-black")}>
                      <Contrast size={32} />
                      <span className="font-black uppercase text-[10px]">Contraste</span>
                    </button>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", isDarkMode ? "bg-zinc-600" : "bg-zinc-100")}>
                      {isDarkMode ? <Sun size={32} /> : <Moon size={32} />}
                      <span className="font-black uppercase text-[10px]">{isDarkMode ? "Modo Claro" : "Modo Escuro"}</span>
                    </button>
                    <button onClick={() => setColorblindMode(!colorblindMode)} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", colorblindMode ? "bg-yellow-200" : "bg-white")}>
                      <Palette size={32} className="text-black" />
                      <span className="font-black uppercase text-[10px] text-black">Daltônicos</span>
                    </button>
                  </div>
                </section>

                {/* AUDIÇÃO */}
                <section>
                  <h3 className="font-black text-sm uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2"><Volume2 size={18}/> Audição</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => speak("Menu de acessibilidade aberto")} className="h-28 rounded-2xl border-[4px] border-black bg-orange-400 flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <Volume2 size={32} className="text-black" />
                      <span className="font-black uppercase text-[10px] text-black">Ler Tela</span>
                    </button>
                    <button onClick={() => triggerHaptic([500])} className="h-28 rounded-2xl border-[4px] border-black bg-yellow-400 flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <Maximize2 size={32} className="text-black" />
                      <span className="font-black uppercase text-[10px] text-black">Vibrar Forte</span>
                    </button>
                  </div>
                </section>

                {/* MOTORA */}
                <section>
                  <h3 className="font-black text-sm uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2"><Smartphone size={18}/> Motora</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setLockEdit(!lockEdit)} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", lockEdit ? "bg-red-400 text-black shadow-none mt-1 ml-1" : "bg-[#fcd34d] text-black")}>
                      {lockEdit ? <Lock size={32} /> : <Unlock size={32} />}
                      <span className="font-black uppercase text-[10px]">{lockEdit ? "Edição Travada" : "Travar Edição"}</span>
                    </button>
                    <button onClick={() => setVibrateOnTouch(!vibrateOnTouch)} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", vibrateOnTouch ? "bg-green-400" : "bg-gray-100")}>
                      <Smartphone size={32} className="text-black" />
                      <span className="font-black uppercase text-[10px] text-black">Vibrar ao Tocar</span>
                    </button>
                  </div>
                </section>

                {/* COGNITIVA */}
                <section>
                  <h3 className="font-black text-sm uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2"><HelpCircle size={18}/> Cognitiva</h3>
                  <div className="grid grid-cols-1">
                    <button onClick={handleWhereAmI} className="h-28 rounded-2xl border-[4px] border-black bg-purple-400 flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
                      <MapPin size={36} className="text-black" />
                      <span className="font-black uppercase text-[12px] text-black">Onde Estou?</span>
                    </button>
                  </div>
                </section>
              </div>

              <div className="p-6 sm:p-8 bg-gray-100 border-t-[6px] border-black flex-shrink-0">
                <button onClick={() => setShowAccessModal(false)} className="w-full h-20 bg-[#ef4444] text-white rounded-[24px] border-[4px] border-black font-black uppercase text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">FECHAR</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
