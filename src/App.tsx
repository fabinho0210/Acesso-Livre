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
  icon?: string;
  createdAt: number;
}

interface CursorPos {
  x: number;
  y: number;
}

// Global Voice State
let recognition: any = null;
if (typeof window !== 'undefined' && ('WebkitSpeechRecognition' in window || 'speechRecognition' in window)) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = true;
  recognition.interimResults = false;
}

// --- Translations ---
const translations = {
  pt: {
    title: "Acesso Livre",
    settings: "Acessibilidade",
    voiceGuide: "Guia de Voz",
    performance: "Desempenho",
    reduceAnimations: "Reduzir Animações",
    feedback: "Feedback",
    vibration: "Vibração (Feedback Tátil)",
    clickEffects: "Efeitos de Clique",
    appearance: "Aparência",
    darkMode: "Modo Escuro",
    highContrastEnable: "ATIVAR ALTO CONTRASTE",
    highContrastDisable: "DESATIVAR ALTO CONTRASTE",
    themeColors: "Temas de Cor",
    operation: "Operação",
    assistiveMode: "MODO ASSISTIVO (Trackpad)",
    directMode: "MODO DIRETO (Toque)",
    done: "CONCLUIR",
    understand: "Entendi",
    back: "Voltar",
    home: "Início",
    help: "Ajuda",
    menu: "Menu",
    newApp: "Novo App",
    trackpad: "TRACKPAD",
    appOpened: "Abrindo",
    clicking: "Clicando",
    scrollingUp: "Subindo",
    scrollingDown: "Descendo",
    moving: "Movendo",
    resetVision: "Limpar visão",
    settingsOpened: "Configurações",
    voiceGuideOpened: "Guia de voz",
    darkModeOn: "Escuro ativado",
    darkModeOff: "Claro ativado",
    contrastChanged: "Alto contraste alterado",
    zoomIn: "Zoom aumentado",
    zoomOut: "Zoom reduzido",
    visionRestored: "Visão restaurada",
    youSaid: "Você disse",
    listening: "Ouvindo comandos",
    removeApp: "Remover este aplicativo?",
    appName: "Nome do aplicativo:",
    language: "Idioma",
    dwellTitle: "Clique por Permanência",
    dwellDesc: "Clica automaticamente ao pairar sobre um item",
    permanentLauncher: "Launcher Permanente",
    howToPin: "Como fixar no celular",
    pinTitle: "Tornar Permanente",
    pinInstructions: [
      "1. Abra este site no Chrome ou Safari",
      "2. Clique no menu (3 pontos) ou compartilhar",
      "3. Escolha 'Adicionar à tela de início'",
      "4. Android: Mude o 'App de Início' nos Ajustes."
    ],
    colorblindMode: "Modo para Daltônicos",
    colorblindTypes: {
      none: "Nenhum",
      protanopia: "Protanopia",
      deuteranopia: "Deuteranopia",
      tritanopia: "Tritanopia"
    },
    fontSizeTitle: "Tamanho da Fonte",
    fontSizeChanged: "Tamanho da fonte alterado",
    small: "Pequeno",
    medium: "Médio",
    large: "Grande",
    commands: {
      basic: "Comandos Básicos",
      nav: "Navegação e Tela",
      at: "Acessibilidade (Disartria)",
      click: "Clique, Abrir, Sim",
      back: "Voltar",
      home: "Início, Home, Casa",
      up: "Subir, Cima",
      down: "Descer, Baixo",
      move: "Mover para [Lado]",
      zoom: "Aumentar / Diminuir Zoom",
      settings: "Modo Escuro/Claro, Alto Contraste, Tamanho da Fonte",
      disartriaDica: "Abreviações simplificadas para fala lenta ou parcial:",
    }
  },
  en: {
    title: "Free Access",
    settings: "Accessibility",
    voiceGuide: "Voice Guide",
    performance: "Performance",
    reduceAnimations: "Reduce Animations",
    feedback: "Feedback",
    vibration: "Vibration (Haptic)",
    clickEffects: "Click Effects",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    highContrastEnable: "ENABLE HIGH CONTRAST",
    highContrastDisable: "DISABLE HIGH CONTRAST",
    themeColors: "Theme Colors",
    operation: "Operation",
    assistiveMode: "ASSISTIVE MODE (Trackpad)",
    directMode: "DIRECT MODE (Touch)",
    done: "DONE",
    understand: "Got it",
    back: "Back",
    home: "Home",
    help: "Help",
    menu: "Menu",
    newApp: "New App",
    trackpad: "TRACKPAD",
    appOpened: "Opening",
    clicking: "Clicking",
    scrollingUp: "Going up",
    scrollingDown: "Going down",
    moving: "Moving",
    resetVision: "Clear view",
    settingsOpened: "Settings",
    voiceGuideOpened: "Voice guide",
    darkModeOn: "Dark mode on",
    darkModeOff: "Light mode on",
    contrastChanged: "Contrast changed",
    zoomIn: "Zoomed in",
    zoomOut: "Zoomed out",
    visionRestored: "View restored",
    youSaid: "You said",
    listening: "Listening for commands",
    removeApp: "Remove this app?",
    appName: "App name:",
    language: "Language",
    dwellTitle: "Dwell Clicking",
    dwellDesc: "Automatically clicks after hovering over an item",
    permanentLauncher: "Permanent Launcher",
    howToPin: "How to pin to mobile",
    pinTitle: "Make Permanent",
    pinInstructions: [
      "1. Open this site in Chrome or Safari",
      "2. Click the menu (3 dots) or Share",
      "3. Choose 'Add to Home Screen'",
      "4. Android: Change 'Home App' in Settings."
    ],
    colorblindMode: "Colorblind Mode",
    colorblindTypes: {
      none: "None",
      protanopia: "Protanopia",
      deuteranopia: "Deuteranopia",
      tritanopia: "Tritanopia"
    },
    fontSizeTitle: "Font Size",
    fontSizeChanged: "Font size changed",
    small: "Small",
    medium: "Medium",
    large: "Large",
    commands: {
      basic: "Basic Commands",
      nav: "Nav & Screen",
      at: "Accessibility (Dysarthria)",
      click: "Click, Open, Yes",
      back: "Back",
      home: "Home, Start",
      up: "Up, Scroll up",
      down: "Down, Scroll down",
      move: "Move [Direction]",
      zoom: "Zoom: More, Less, Reset",
      settings: "Dark/Light Mode, High Contrast, Font Size",
      disartriaDica: "Simplified abbreviations for slow or partial speech:",
    }
  },
  es: {
    title: "Acceso Libre",
    settings: "Accesibilidad",
    voiceGuide: "Guía de Voz",
    performance: "Rendimiento",
    reduceAnimations: "Reducir Animaciones",
    feedback: "Comentarios",
    vibration: "Vibración (Háptico)",
    clickEffects: "Efectos de Clic",
    appearance: "Apariencia",
    darkMode: "Modo Oscuro",
    highContrastEnable: "ACTIVAR ALTO CONTRASTE",
    highContrastDisable: "DESACTIVAR ALTO CONTRASTE",
    themeColors: "Temas de Color",
    operation: "Operación",
    assistiveMode: "MODO ASISTIVO (Trackpad)",
    directMode: "MODO DIRETO (Toque)",
    done: "HECHO",
    understand: "Entendido",
    back: "Volver",
    home: "Inicio",
    help: "Ayuda",
    menu: "Menú",
    newApp: "Nueva App",
    trackpad: "TRACKPAD",
    appOpened: "Abriendo",
    clicking: "Haciendo clic",
    scrollingUp: "Subiendo",
    scrollingDown: "Bajando",
    moving: "Moviendo",
    resetVision: "Ver todo",
    settingsOpened: "Ajustes",
    voiceGuideOpened: "Guía de voz",
    darkModeOn: "Oscuro activado",
    darkModeOff: "Claro activado",
    contrastChanged: "Contraste cambiado",
    zoomIn: "Aumentar zoom",
    zoomOut: "Disminuir zoom",
    visionRestored: "Visión restaurada",
    youSaid: "Dijiste",
    listening: "Escuchando comandos",
    removeApp: "¿Eliminar esta aplicación?",
    appName: "Nombre de la aplicación:",
    language: "Idioma",
    dwellTitle: "Clic por Permanencia",
    dwellDesc: "Hace clic automáticamente al pasar sobre un elemento",
    permanentLauncher: "Launcher Permanente",
    howToPin: "Cómo fijar en el móvil",
    pinTitle: "Hacer Permanente",
    pinInstructions: [
      "1. Abre este sitio en Chrome o Safari",
      "2. Haz clic en el menú (3 puntos) o Compartir",
      "3. Elige 'Añadir a la pantalla de inicio'",
      "4. Android: Cambia 'App de Inicio' en Ajustes."
    ],
    colorblindMode: "Modo para Daltónicos",
    colorblindTypes: {
      none: "Ninguno",
      protanopia: "Protanopia",
      deuteranopia: "Deuteranopia",
      tritanopia: "Tritanopia"
    },
    fontSizeTitle: "Tamaño de Fuente",
    fontSizeChanged: "Tamaño de fuente cambiado",
    small: "Pequeño",
    medium: "Medio",
    large: "Grande",
    commands: {
      basic: "Comandos Básicos",
      nav: "Navegación y Pantalla",
      at: "Accesibilidad (Disartria)",
      click: "Clic, Abrir, Sí",
      back: "Volver",
      home: "Inicio, Casa",
      up: "Subir, Arriba",
      down: "Bajar, Abajo",
      move: "Mover a [Lado]",
      zoom: "Zoom: Más, Menos, Reset",
      settings: "Modo Oscuro/Claro, Alto Contraste, Tamaño de Fuente",
      disartriaDica: "Abreviaturas simplificadas para habla lenta o parcial:",
    }
  }
};

export default function App() {
  const [lang, setLang] = useState<'pt' | 'en' | 'es'>(() => {
    return (localStorage.getItem('launcher_lang') as 'pt' | 'en' | 'es') || 'pt';
  });
  const t = translations[lang];

  const [cursorPos, setCursorPos] = useState<CursorPos>({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [clickRipples, setClickRipples] = useState<{ id: number, x: number, y: number }[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const [showPinGuide, setShowPinGuide] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('launcher_highContrast') === 'true');
  const [dwellEnabled, setDwellEnabled] = useState(() => localStorage.getItem('launcher_dwellEnabled') === 'true');
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [isAssistiveMode, setIsAssistiveMode] = useState(() => localStorage.getItem('launcher_assistiveMode') !== 'false');
  const [systemTheme, setSystemTheme] = useState<'yellow' | 'blue' | 'green' | 'purple'>('yellow');
  const [colorblindMode, setColorblindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>(() => {
    return (localStorage.getItem('launcher_colorblindMode') as any) || 'none';
  });
  const [vibrationEnabled, setVibrationEnabled] = useState(() => localStorage.getItem('launcher_vibration') !== 'false');
  const [advancedVisualsEnabled, setAdvancedVisualsEnabled] = useState(true);
  const [lowPerformanceMode, setLowPerformanceMode] = useState(() => localStorage.getItem('launcher_lowPerformance') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('launcher_darkMode') === 'true');
  const [isHoveringElement, setIsHoveringElement] = useState<string | null>(null);
  const [isTrackpadHovered, setIsTrackpadHovered] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);

  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    return (localStorage.getItem('launcher_fontSize') as 'small' | 'medium' | 'large') || 'medium';
  });
  const [zoomScale, setZoomScale] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });

  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dwellProgressRef = useRef(0);

  const cursorX = useSpring(useMotionValue(50), { stiffness: 300, damping: 30 });
  const cursorY = useSpring(useMotionValue(50), { stiffness: 300, damping: 30 });

  const [apps, setApps] = useState<AppData[]>(() => {
    const saved = localStorage.getItem('launcher_apps');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'app-phone', label: lang === 'pt' ? 'Telefone' : (lang === 'en' ? 'Phone' : 'Teléfono'), color: 'bg-green-500', createdAt: Date.now() },
      { id: 'app-whatsapp', label: 'WhatsApp', color: 'bg-emerald-600', createdAt: Date.now() + 1 },
      { id: 'app-emergency', label: lang === 'pt' ? 'Emergência' : (lang === 'en' ? 'S O S' : 'Emergencia'), color: 'bg-red-600', createdAt: Date.now() + 2 },
      { id: 'app-family', label: lang === 'pt' ? 'Família' : (lang === 'en' ? 'Family' : 'Familia'), color: 'bg-purple-500', createdAt: Date.now() + 3 },
    ];
  });

  // Save apps to local storage
  useEffect(() => {
    localStorage.setItem('launcher_apps', JSON.stringify(apps));
  }, [apps]);

  // Persist settings on change
  const saveSettings = (name: string, value: any) => {
    localStorage.setItem(`launcher_${name}`, String(value));
  };

  const getIcon = (idOrLabel: string) => {
    const l = (idOrLabel || '').toLowerCase();
    if (l.includes('phone') || l.includes('telefone')) return <Phone size={48} />;
    if (l.includes('whatsapp')) return <MessageSquare size={48} />;
    if (l.includes('s o s') || l.includes('emergência') || l.includes('emergencia')) return <Plus size={48} />;
    if (l.includes('family') || l.includes('família') || l.includes('familia')) return <Home size={48} />;
    return <Plus size={48} title="Generic Icon" />; // Added title for aria support if needed
  }


  const [uiPrefs, setUiPrefs] = useState({
    buttonSize: 1,
    leftHanded: false,
    trackpadHeight: 40,
  });

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-2xl';
      default: return 'text-xl';
    }
  };

  const getThemeColor = () => {
    const isDark = isDarkMode || highContrast;
    if (highContrast) return 'bg-white text-black ring-4 ring-white ring-offset-4 ring-offset-black';
    switch (systemTheme) {
      case 'yellow': return 'bg-yellow-400 text-black';
      case 'blue': return 'bg-blue-400 text-black';
      case 'green': return 'bg-green-400 text-black';
      case 'purple': return 'bg-purple-500 text-white';
      default: return 'bg-yellow-400 text-black';
    }
  };

  const animConfig = {
    duration: lowPerformanceMode ? 0.1 : 0.3,
    ease: lowPerformanceMode ? "linear" : "easeOut",
    type: lowPerformanceMode ? "tween" : "spring",
    stiffness: 300,
    damping: 30
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      switch (lang) {
        case 'en': utterance.lang = 'en-US'; break;
        case 'es': utterance.lang = 'es-ES'; break;
        default: utterance.lang = 'pt-BR';
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (recognition) {
      recognition.stop();
      switch (lang) {
        case 'en': recognition.lang = 'en-US'; break;
        case 'es': recognition.lang = 'es-ES'; break;
        default: recognition.lang = 'pt-BR';
      }
      if (isVoiceActive) recognition.start();
    }
  }, [lang]);

  const HAPTIC_PATTERNS = {
    CLICK: [40],
    SUCCESS: [50, 40, 50],
    ERROR: [150, 50, 150],
    DELETE: [200],
    NAV: [30]
  };

  const triggerHaptic = (pattern: number[]) => {
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleClick = (pattern: keyof typeof HAPTIC_PATTERNS = 'CLICK') => {
    setIsClicking(true);
    
    if (advancedVisualsEnabled && !lowPerformanceMode) {
      const newRipple = { id: Date.now(), x: cursorPos.x, y: cursorPos.y };
      setClickRipples(prev => [...prev.slice(-3), newRipple]); 
      
      setTimeout(() => {
        setClickRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 800);
    }

    triggerHaptic(HAPTIC_PATTERNS[pattern]);
    
    setTimeout(() => {
      setIsClicking(false);
    }, 150);
    
    const headerH = window.innerWidth < 640 ? 80 : 96;
    const mainH = (window.innerHeight * 0.6) - headerH;
    const xPx = (cursorPos.x / 100) * window.innerWidth;
    const yPx = (cursorPos.y / 100) * mainH + headerH;
    const el = document.elementFromPoint(xPx, yPx);
    
    if (el && el instanceof HTMLElement) {
      if (screenReaderEnabled) speak(`Clicado em ${el.getAttribute('aria-label') || el.innerText || 'item'}`);
      el.click();
    }
  };

  const handleTrackpadMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      const touch = e.touches[0];
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setCursorPos({ 
        x: Math.max(0, Math.min(100, x)), 
        y: Math.max(0, Math.min(100, y)) 
      });
    }
  }, []);

  useEffect(() => {
    cursorX.set(cursorPos.x);
    cursorY.set(cursorPos.y);

    const checkHover = () => {
      const headerH = window.innerWidth < 640 ? 80 : 96;
      const mainH = (window.innerHeight * 0.6) - headerH;
      const xPx = (cursorPos.x / 100) * window.innerWidth;
      const yPx = (cursorPos.y / 100) * mainH + headerH;
      const el = document.elementFromPoint(xPx, yPx);
      const elementId = el?.id || el?.closest('button')?.id || null;

      if (elementId && elementId !== hoveredId) {
        setHoveredId(elementId);
        const label = el?.getAttribute('aria-label') || el?.textContent || 'Botão';
        setIsHoveringElement(label);
        
        if (screenReaderEnabled) speak(label);
        if ('vibrate' in navigator) navigator.vibrate(10);
      } else if (!elementId && hoveredId) {
        setHoveredId(null);
        setIsHoveringElement(null);
      }

      if (dwellEnabled && elementId && elementId !== 'main-trackpad') {
        if (dwellTimerRef.current && hoveredId === elementId) return; 
        
        // Reset if we moved to a new element
        if (dwellTimerRef.current) {
          clearInterval(dwellTimerRef.current);
          dwellTimerRef.current = null;
        }

        dwellProgressRef.current = 0;
        setDwellProgress(0);
        
        dwellTimerRef.current = setInterval(() => {
          dwellProgressRef.current += 10; // Faster progress
          setDwellProgress(dwellProgressRef.current);
          if (dwellProgressRef.current >= 100) {
            handleClick();
            clearInterval(dwellTimerRef.current!);
            dwellTimerRef.current = null;
            dwellProgressRef.current = 0;
            setDwellProgress(0);
          }
        }, 150); // ~1.5s total dwell time
      } else if (!elementId || elementId === 'main-trackpad' || !dwellEnabled) {
        if (dwellTimerRef.current) {
          clearInterval(dwellTimerRef.current);
          dwellTimerRef.current = null;
          setDwellProgress(0);
        }
      }
    };

    if (lowPerformanceMode) {
      const timer = setTimeout(checkHover, 60);
      return () => clearTimeout(timer);
    } else {
      checkHover();
    }
  }, [cursorPos, dwellEnabled, screenReaderEnabled, hoveredId, lowPerformanceMode]);

  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      setLastCommand(command);
      
      setTimeout(() => setLastCommand(''), 3000);
      
      triggerHaptic(HAPTIC_PATTERNS.CLICK);

      // --- COMMAND CATEGORIES ---
      const isScrollUp = command.includes('cima') || command.includes('rolar para cima') || command.includes('subir') || command.includes(' su ') || 
                         command.includes('up') || command.includes('scroll up') || command.includes('arriba') || command.includes('subir');
      
      const isScrollDown = command.includes('baixo') || command.includes('rolar para baixo') || command.includes('descer') || command.includes(' de ') || 
                           command.includes('down') || command.includes('scroll down') || command.includes('abajo') || command.includes('bajar');
      
      const isClick = command.includes('clique') || command.includes('abrir item') || command.includes(' ki ') || command.includes(' ti ') || command.includes(' sim ') || command.includes(' vai ') ||
                      command.includes('click') || command.includes('open') || command.includes('yes') || command.includes('clic') || command.includes('abrir') || command.includes('si');
      
      const isHome = command.includes('início') || command.includes('home') || command.includes('casa') || command.includes(' ca ') ||
                     command.includes('start') || command.includes('inicio');
      
      const isBack = command.includes('voltar') || command.includes(' bo ') || 
                     command.includes('back') || command.includes('volver') || command.includes('atras');

      // --- ACTION EXECUTION ---
      if (isClick) {
        handleClick();
        speak(t.clicking);
      } 
      
      if (isScrollUp) {
        setPanPos(prev => ({ ...prev, y: Math.min(prev.y + 200, 0) }));
        speak(t.scrollingUp);
      } else if (isScrollDown) {
        setPanPos(prev => ({ ...prev, y: prev.y - 200 }));
        speak(t.scrollingDown);
      }

      // Drag Simulation (Move cursor to corners or center)
      if (command.includes('arrastar') || command.includes('mover') || command.includes('drag') || command.includes('move') || command.includes('arrastrar')) {
        if (command.includes('esquerda') || command.includes('left') || command.includes('izquierda')) setCursorPos(p => ({ ...p, x: Math.max(0, p.x - 20) }));
        if (command.includes('direita') || command.includes('right') || command.includes('derecha')) setCursorPos(p => ({ ...p, x: Math.min(100, p.x + 20) }));
        if (command.includes('cima') || command.includes('up') || command.includes('arriba')) setCursorPos(p => ({ ...p, y: Math.max(0, p.y - 20) }));
        if (command.includes('baixo') || command.includes('down') || command.includes('abajo')) setCursorPos(p => ({ ...p, y: Math.min(100, p.y + 20) }));
        speak(t.moving);
      }
      
      // Dynamic App Opening
      apps.forEach(app => {
        if (command.includes(app.label.toLowerCase())) {
          triggerHaptic(HAPTIC_PATTERNS.SUCCESS);
          speak(`${t.appOpened} ${app.label}`);
          alert(`${t.appOpened} ${app.label}`);
        }
      });

      // Navigation
      if (isBack) {
        triggerHaptic(HAPTIC_PATTERNS.NAV);
        speak(t.back);
      } else if (isHome) {
        triggerHaptic(HAPTIC_PATTERNS.NAV);
        setPanPos({ x: 0, y: 0 });
        setZoomScale(1);
        speak(t.home);
      } else if (command.includes('menu') || command.includes('opções') || command.includes('options') || command.includes('opciones')) {
        triggerHaptic(HAPTIC_PATTERNS.NAV);
        speak(t.menu);
      } else if (command.includes('fixar') || command.includes('instalar') || command.includes('permanente') || command.includes('pin') || command.includes('install')) {
        setShowPinGuide(true);
        speak(t.pinTitle);
      }

      // System Controls
      if (command.includes('ajustes') || command.includes('configurações') || command.includes('ajuda') || 
          command.includes('settings') || command.includes('help') || 
          command.includes('ajustes') || command.includes('ayuda')) {
        setShowVoiceGuide(true);
        speak(t.voiceGuideOpened);
      } else if (command.includes('modo escuro') || command.includes('dark mode') || command.includes('modo oscuro')) {
        setIsDarkMode(true);
        saveSettings('darkMode', true);
        speak(t.darkModeOn);
      } else if (command.includes('modo claro') || command.includes('light mode') || command.includes('modo claro')) {
        setIsDarkMode(false);
        saveSettings('darkMode', false);
        speak(t.darkModeOff);
      } else if (command.includes('alto contraste') || command.includes('high contrast') || command.includes('alto contraste')) {
        setHighContrast(prev => {
          const newVal = !prev;
          saveSettings('highContrast', newVal);
          return newVal;
        });
        speak(t.contrastChanged);
      } else if (command.includes('fonte pequena') || command.includes('small font') || command.includes('letra pequeña') || command.includes('tamanho pequeno')) {
        setFontSize('small');
        saveSettings('fontSize', 'small');
        speak(t.fontSizeChanged);
      } else if (command.includes('fonte média') || command.includes('medium font') || command.includes('letra mediana') || command.includes('tamanho médio')) {
        setFontSize('medium');
        saveSettings('fontSize', 'medium');
        speak(t.fontSizeChanged);
      } else if (command.includes('fonte grande') || command.includes('large font') || command.includes('letra grande') || command.includes('tamanho grande')) {
        setFontSize('large');
        saveSettings('fontSize', 'large');
        speak(t.fontSizeChanged);
      }

      // Zoom & Navigation Controls
      if (command.includes('aumentar zoom') || command.includes('mais zoom') || command.includes('zoom in') || command.includes('más zoom')) {
        setZoomScale(s => Math.min(s + 0.3, 3));
        speak(t.zoomIn);
      } else if (command.includes('diminuir zoom') || command.includes('menos zoom') || command.includes('zoom out')) {
        setZoomScale(s => Math.max(s - 0.3, 0.5));
        speak(t.zoomOut);
      } else if (command.includes('resetar') || command.includes('limpar') || command.includes('centralizar') || command.includes('reset') || command.includes('normal')) {
        setZoomScale(1);
        setPanPos({ x: 0, y: 0 });
        speak(t.visionRestored);
      }
    };
    return () => recognition.stop();
  }, [apps]);

  const toggleVoice = () => {
    if (!recognition) return;
    if (isVoiceActive) {
      recognition.stop();
      setIsVoiceActive(false);
    } else {
      recognition.start();
      setIsVoiceActive(true);
      speak("Ouvindo comandos");
    }
  };

  const addApp = () => {
    const name = prompt(t.appName);
    if (name) {
      const newApp: AppData = {
        id: `app-${Date.now()}`,
        label: name,
        color: 'bg-blue-500',
        createdAt: Date.now()
      };
      setApps(prev => [...prev, newApp]);
      speak(`${t.newApp}: ${name}`);
    }
  };

  const deleteApp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(HAPTIC_PATTERNS.DELETE);
    if (confirm(t.removeApp)) {
      setApps(prev => prev.filter(app => app.id !== id));
      speak(t.done);
    }
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 h-dvh flex flex-col overflow-hidden select-none transition-colors duration-500 safe-top safe-bottom [--header-height:80px] sm:[--header-height:96px]", 
        highContrast ? "bg-black text-white" : (isDarkMode ? "bg-zinc-950 text-white" : "bg-[#f5f5f0] text-gray-900")
      )}
      style={{ filter: colorblindMode !== 'none' ? `url(#${colorblindMode})` : 'none' }}
    >
      <header className={cn(
        "h-20 sm:h-24 px-4 sm:px-8 flex items-center justify-between border-b-4 border-black transition-colors duration-500", 
        highContrast ? "bg-zinc-950 border-white/20" : (isDarkMode ? "bg-zinc-900 border-black" : "bg-white border-black")
      )}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", getThemeColor())}>
            <MousePointer2 size={24} className="sm:w-[28px] sm:h-[28px]" strokeWidth={3} />
          </div>
          <h1 className={cn("font-black uppercase italic leading-none whitespace-nowrap", 
            fontSize === 'large' ? 'text-2xl sm:text-3xl' : fontSize === 'small' ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
          )}>{t.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          {lastCommand && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "px-4 py-1 rounded-full border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mr-4 whitespace-nowrap",
                highContrast ? "bg-white text-black" : "bg-yellow-400 text-black"
              )}
            >
              {t.youSaid}: "{lastCommand}"
            </motion.div>
          )}

          <button 
            id="settings-btn" 
            aria-label={t.settings}
            onClick={() => { triggerHaptic(HAPTIC_PATTERNS.NAV); setShowSettings(true); }} 
            className={cn(
              "p-3 rounded-2xl border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all",
              isDarkMode || highContrast ? "bg-zinc-800 text-white" : "bg-white text-black"
            )}
          >
            <Settings size={32} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className={cn(
        "relative flex-1 transition-colors duration-500", 
        isAssistiveMode ? "overflow-hidden touch-none" : "overflow-y-auto",
        highContrast ? "bg-black" : (isDarkMode ? "bg-zinc-900" : "bg-gray-200")
      )}>
        <motion.div animate={{ scale: zoomScale, x: panPos.x, y: panPos.y }} transition={animConfig} className="w-full h-full p-4 sm:p-8 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 auto-rows-max">
      {apps.map((app) => (
            <AppButton 
              key={app.id} 
              id={app.id} 
              label={app.label} 
              color={app.color} 
              onClick={() => { triggerHaptic(HAPTIC_PATTERNS.SUCCESS); /* speak(app.label) */ }} 
              onDelete={deleteApp} 
              highContrast={highContrast} 
              isDarkMode={isDarkMode}
              fontSizeClass={getFontSizeClass()} 
              isHovered={hoveredId === app.id} 
              themeColor={getThemeColor()} 
              icon={getIcon(app.label)}
            />
          ))}
          <button 
            id="add-app-btn" 
            aria-label={t.newApp}
            onClick={() => { triggerHaptic(HAPTIC_PATTERNS.SUCCESS); addApp(); }} 
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-[32px] border-4 border-dashed h-full min-h-[160px] sm:min-h-[220px] transition-all",
              highContrast 
                ? "border-zinc-700 bg-zinc-900 text-zinc-400" 
                : (isDarkMode ? "border-zinc-700 bg-zinc-800/50 text-zinc-500" : "border-gray-400 bg-white/50 text-gray-400"),
              hoveredId === 'add-app-btn' && (highContrast ? "border-white text-white" : "border-black text-black scale-105")
            )}
          >
            <Plus size={48} className="w-8 h-8 sm:w-12 sm:h-12" aria-hidden="true" />
            <span className="font-black uppercase text-xs sm:text-sm mt-2">{t.newApp}</span>
          </button>
        </motion.div>
      </main>

      {isAssistiveMode && (
        <>
          <div className="fixed inset-0 pointer-events-none z-[300]">
            {!lowPerformanceMode && advancedVisualsEnabled && clickRipples.map(ripple => (
              <motion.div key={ripple.id} initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 25, opacity: 0 }} transition={{ duration: 1 }} className={cn("absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-black/20")} style={{ left: `${ripple.x}%`, top: `calc(${ripple.y}% + var(--header-height, 80px))` }} />
            ))}
            <motion.div className="absolute top-0 left-0 origin-top-left" style={{ transform: `translate(${cursorPos.x}vw, ${cursorPos.y}vh)`, x: '-10px', y: '-10px', marginTop: 'var(--header-height, 80px)' }}>
              <div className="relative">
                {dwellEnabled && dwellProgress > 0 && (
                  <div className="absolute -top-4 -left-4 w-20 h-20 pointer-events-none flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="black"
                        strokeWidth="8"
                        fill="transparent"
                        className="opacity-20"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke={highContrast ? "white" : "black"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={213.6}
                        strokeDashoffset={213.6 - (213.6 * dwellProgress) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-150"
                      />
                    </svg>
                  </div>
                )}
                <motion.div animate={{ rotate: isClicking ? -15 : 0 }} transition={animConfig}>
                  <MousePointer2 size={64} className={cn("drop-shadow-lg", highContrast ? "text-white" : "text-black fill-yellow-400")} />
                </motion.div>
              </div>
            </motion.div>
          </div>

          <section className={cn(
            "border-t-4 border-black flex flex-col z-50 transition-colors duration-500", 
            highContrast ? "bg-zinc-950" : (isDarkMode ? "bg-zinc-900" : "bg-white")
          )} style={{ height: `${uiPrefs.trackpadHeight}vh`, minHeight: '200px' }}>
            <div className="flex w-full h-16 sm:h-20 border-b-4 border-black divide-x-4 divide-black text-black">
              <NavButton id="back-nav" onClick={() => triggerHaptic(HAPTIC_PATTERNS.NAV)} icon={<ArrowLeft size={32} className="sm:w-[36px] sm:h-[36px]" aria-hidden="true" />} label={t.back} highContrast={highContrast} isDarkMode={isDarkMode} fontSizeClass={fontSize === 'large' ? 'text-xs sm:text-sm' : fontSize === 'small' ? 'text-[7px] sm:text-[8px]' : 'text-[9px] sm:text-[10px]'} isHovered={hoveredId === 'back-nav'} themeColor={getThemeColor()} />
              <NavButton id="help-nav" onClick={() => setShowVoiceGuide(true)} icon={<Search size={32} className="sm:w-[36px] sm:h-[36px]" aria-hidden="true" />} label={t.help} highContrast={highContrast} isDarkMode={isDarkMode} fontSizeClass={fontSize === 'large' ? 'text-xs sm:text-sm' : fontSize === 'small' ? 'text-[7px] sm:text-[8px]' : 'text-[9px] sm:text-[10px]'} isHovered={hoveredId === 'help-nav'} themeColor={getThemeColor()} />
              <NavButton id="home-nav" onClick={() => { setPanPos({x:0,y:0}); setZoomScale(1); }} icon={<Home size={32} className="sm:w-[36px] sm:h-[36px]" aria-hidden="true" />} label={t.home} highContrast={highContrast} isDarkMode={isDarkMode} fontSizeClass={fontSize === 'large' ? 'text-xs sm:text-sm' : fontSize === 'small' ? 'text-[7px] sm:text-[8px]' : 'text-[9px] sm:text-[10px]'} isHovered={hoveredId === 'home-nav'} themeColor={getThemeColor()} />
              <NavButton id="menu-nav" onClick={() => triggerHaptic(HAPTIC_PATTERNS.NAV)} icon={<Menu size={32} className="sm:w-[36px] sm:h-[36px]" aria-hidden="true" />} label={t.menu} highContrast={highContrast} isDarkMode={isDarkMode} fontSizeClass={fontSize === 'large' ? 'text-xs sm:text-sm' : fontSize === 'small' ? 'text-[7px] sm:text-[8px]' : 'text-[9px] sm:text-[10px]'} isHovered={hoveredId === 'menu-nav'} themeColor={getThemeColor()} />
            </div>
            <div className="flex-1 flex">
              <div className="w-1/4 max-w-[120px] border-r border-black flex items-center justify-center">
                <button 
                  id="voice-toggle" 
                  aria-label={t.listening}
                  onClick={toggleVoice} 
                  className={cn(
                    "w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-black flex items-center justify-center transition-all", 
                    isVoiceActive ? "bg-red-500 animate-pulse" : (isDarkMode || highContrast ? "bg-zinc-800" : "bg-gray-100")
                  )}
                >
                  {isVoiceActive ? <Mic size={24} className="sm:w-[32px] sm:h-[32px]" color="white" aria-hidden="true" /> : <MicOff size={24} className={cn("sm:w-[32px] sm:h-[32px]", isDarkMode || highContrast ? "text-white" : "text-black")} aria-hidden="true" />}
                </button>
              </div>
              <div id="main-trackpad" className={cn(
                "flex-1 relative touch-none transition-colors duration-500",
                isDarkMode || highContrast ? "bg-zinc-950" : "bg-gray-100"
              )} onTouchMove={handleTrackpadMove} onMouseMove={(e) => e.buttons === 1 && handleTrackpadMove(e as any)} onClick={() => handleClick()}>
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <span className={cn("font-black text-[10px] sm:text-xs tracking-widest", isDarkMode || highContrast ? "text-white" : "text-black")}>{t.trackpad}</span>
                </div>
              </div>
              <div className="w-1/4 max-w-[120px] border-l border-black flex flex-col divide-y-4 divide-black">
                 <button aria-label="Aumentar zoom da tela" onClick={() => setZoomScale(s => Math.min(s + 0.2, 3))} className={cn("flex-1 flex items-center justify-center hover:bg-black/10 transition-colors", (isDarkMode || highContrast) && "text-white")}>
                   <ZoomIn className="w-6 h-6 sm:w-auto" aria-hidden="true" />
                 </button>
                 <button aria-label="Diminuir zoom da tela" onClick={() => setZoomScale(s => Math.max(s - 0.2, 0.5))} className={cn("flex-1 flex items-center justify-center hover:bg-black/10 transition-colors", (isDarkMode || highContrast) && "text-white")}>
                   <ZoomOut className="w-6 h-6 sm:w-auto" aria-hidden="true" />
                 </button>
              </div>
            </div>
          </section>
        </>
      )}

      <AnimatePresence>
        {isHoveringElement && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-[42vh] left-1/2 -translate-x-1/2 px-6 py-2 bg-black text-white rounded-full font-bold z-[400] text-lg">
            {isHoveringElement}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPinGuide && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }} 
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className={cn(
              "w-full max-w-lg p-8 border-4 border-black rounded-[40px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative",
              highContrast ? "bg-zinc-950 text-white border-white" : "bg-white text-black"
            )}>
              <h2 className="text-3xl font-black uppercase italic mb-6">{t.pinTitle}</h2>
              <div className="space-y-6 mb-8">
                {t.pinInstructions.map((inst, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", getThemeColor())}>
                      {i + 1}
                    </div>
                    <p className="font-bold text-lg leading-tight pt-1">{inst}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowPinGuide(false)} 
                className={cn(
                  "w-full py-6 border-4 border-black rounded-2xl font-black text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all", 
                  getThemeColor()
                )}
              >
                {t.understand}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoiceGuide && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }} 
            className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <div className={cn(
              "w-full max-w-2xl max-h-[85dvh] rounded-[40px] border-4 border-black p-6 sm:p-8 overflow-y-auto shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]",
              highContrast ? "bg-black text-white border-white" : "bg-white text-black"
            )}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black italic uppercase">{t.voiceGuide}</h2>
                <button 
                   onClick={() => setShowVoiceGuide(false)} 
                   className={cn("w-12 h-12 rounded-full flex items-center justify-center border-4 border-black", highContrast ? "bg-white text-black" : "bg-black text-white")}
                >
                   <X />
                </button>
              </div>

              <div className="space-y-8">
                <CommandSection title={t.commands.basic}>
                  <CommandLine label={t.commands.click} cmd={t.commands.click} short="Ki" />
                  <CommandLine label={t.back} cmd={t.commands.back} short="Bo" />
                  <CommandLine label={t.home} cmd={t.commands.home} short="Ca" />
                </CommandSection>

                <CommandSection title={t.commands.nav}>
                  <CommandLine label={t.scrollingUp} cmd={t.commands.up} short="Su" />
                  <CommandLine label={t.scrollingDown} cmd={t.commands.down} short="De" />
                  <CommandLine label={t.moving} cmd={t.commands.move} />
                  <CommandLine label="Zoom" cmd={t.commands.zoom} short="Zoom" />
                  <CommandLine label={t.visionRestored} cmd="Resetar, Centralizar, Normal" short="Reset" />
                </CommandSection>

                <CommandSection title={t.appearance}>
                  <CommandLine label={t.appearance} cmd={t.commands.settings} />
                </CommandSection>

                <CommandSection title={t.permanentLauncher}>
                  <CommandLine label={t.pinTitle} cmd="Fixar, Instalar, Permanente" short="Fix" />
                </CommandSection>

                <CommandSection title={t.commands.at}>
                  <p className="text-sm opacity-70 mb-2 italic">{t.commands.disartriaDica}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="p-2 bg-gray-100 rounded-xl font-bold">Ki = {t.clicking}</span>
                    <span className="p-2 bg-gray-100 rounded-xl font-bold">Su = {t.scrollingUp}</span>
                    <span className="p-2 bg-gray-100 rounded-xl font-bold">De = {t.scrollingDown}</span>
                    <span className="p-2 bg-gray-100 rounded-xl font-bold">Ca = {t.home}</span>
                  </div>
                </CommandSection>
              </div>

              <button 
                onClick={() => setShowVoiceGuide(false)} 
                className={cn("w-full py-5 mt-8 border-4 border-black rounded-2xl font-black text-xl uppercase", getThemeColor())}
              >
                {t.understand}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            className={cn(
              "fixed inset-0 z-[500] p-4 sm:p-8 flex flex-col items-center overflow-y-auto",
              highContrast ? "bg-black text-white" : "bg-white text-black"
            )}
          >
             <div className="w-full max-w-2xl flex flex-col min-h-full">
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl sm:text-3xl font-black italic uppercase">{t.settings}</h2>
                 <button 
                   aria-label="Fechar configurações"
                   onClick={() => setShowSettings(false)} 
                   className={cn(
                     "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 border-black",
                     highContrast ? "bg-white text-black border-white" : "bg-black text-white"
                   )}
                 >
                   <X aria-hidden="true" />
                 </button>
               </div>

               <div className="space-y-10 pb-20 flex-1">
                 <SettingItem label={t.language}>
                   <div className="flex gap-2 sm:gap-4">
                     {(['pt', 'en', 'es'] as const).map(l => (
                       <button 
                         key={l} 
                         onClick={() => { setLang(l); saveSettings('lang', l); }} 
                         className={cn(
                           "flex-1 p-3 sm:p-4 border-4 border-black rounded-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm sm:text-base",
                           lang === l ? getThemeColor() : (highContrast ? "bg-zinc-900 border-zinc-700" : "bg-gray-100")
                         )}
                       >
                         {l}
                       </button>
                     ))}
                   </div>
                 </SettingItem>

                 <SettingItem label={t.fontSizeTitle}>
                   <div className="flex gap-2 sm:gap-4">
                     {(['small', 'medium', 'large'] as const).map(size => (
                       <button 
                         key={size} 
                         onClick={() => { setFontSize(size); saveSettings('fontSize', size); }} 
                         className={cn(
                           "flex-1 p-3 sm:p-4 border-4 border-black rounded-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-xs sm:text-base",
                           fontSize === size ? getThemeColor() : (highContrast ? "bg-zinc-900 border-zinc-700" : "bg-gray-100")
                         )}
                       >
                         {t[size as keyof typeof t] || size}
                       </button>
                     ))}
                   </div>
                 </SettingItem>

                 <SettingItem label={t.performance}>
                   <button onClick={() => { setLowPerformanceMode(!lowPerformanceMode); saveSettings('lowPerformance', !lowPerformanceMode); }} className={cn("w-full p-4 sm:p-6 border-4 border-black rounded-2xl flex items-center justify-between font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", lowPerformanceMode ? "bg-orange-400 text-black" : (highContrast ? "bg-zinc-900 border-zinc-700 text-zinc-400" : "bg-gray-100 text-gray-500"))}>
                      <div className="flex items-center gap-3"><ZapOff aria-hidden="true" /> {t.reduceAnimations}</div>
                      <div className={cn("w-12 h-6 rounded-full relative transition-colors", lowPerformanceMode ? (highContrast ? "bg-white" : "bg-black") : "bg-gray-300")}>
                          <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", lowPerformanceMode ? "right-1" : "left-1", highContrast && lowPerformanceMode && "bg-black")} />
                      </div>
                   </button>
                 </SettingItem>

                 <SettingItem label={t.feedback}>
                   <div className="flex flex-col gap-4">
                     <button onClick={() => { setDwellEnabled(!dwellEnabled); saveSettings('dwellEnabled', !dwellEnabled); }} className={cn("w-full p-4 sm:p-6 border-4 border-black rounded-2xl flex items-center justify-between font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", dwellEnabled ? "bg-yellow-400 text-black" : (highContrast ? "bg-zinc-900 border-zinc-700 text-zinc-400" : "bg-gray-100 text-gray-500"))}>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-bold whitespace-nowrap">{t.dwellTitle}</span>
                            <span className="text-[10px] sm:text-xs font-normal opacity-70 leading-tight">{t.dwellDesc}</span>
                          </div>
                          <div className={cn("w-12 h-6 rounded-full relative transition-colors", dwellEnabled ? (highContrast ? "bg-white" : "bg-black") : "bg-gray-300")}>
                              <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", dwellEnabled ? "right-1" : "left-1", highContrast && dwellEnabled && "bg-black")} />
                          </div>
                      </button>
                      <button onClick={() => { setVibrationEnabled(!vibrationEnabled); saveSettings('vibration', !vibrationEnabled); }} className={cn("w-full p-4 sm:p-6 border-4 border-black rounded-2xl flex items-center justify-between font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", vibrationEnabled ? "bg-blue-400 text-black" : (highContrast ? "bg-zinc-900 border-zinc-700 text-zinc-400" : "bg-gray-100 text-gray-500"))}>
                        <div className="flex items-center gap-3"><Volume2 aria-hidden="true" /> {t.vibration}</div>
                        <div className={cn("w-12 h-6 rounded-full relative transition-colors", vibrationEnabled ? (highContrast ? "bg-white" : "bg-black") : "bg-gray-300")}>
                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", vibrationEnabled ? "right-1" : "left-1", highContrast && vibrationEnabled && "bg-black")} />
                        </div>
                     </button>
                     <button onClick={() => setAdvancedVisualsEnabled(!advancedVisualsEnabled)} className={cn("w-full p-4 sm:p-6 border-4 border-black rounded-2xl flex items-center justify-between font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", advancedVisualsEnabled ? "bg-purple-400 text-white" : (highContrast ? "bg-zinc-900 border-zinc-700 text-zinc-400" : "bg-gray-100 text-gray-500"))}>
                        <div className="flex items-center gap-3"><Search aria-hidden="true" /> {t.clickEffects}</div>
                        <div className={cn("w-12 h-6 rounded-full relative transition-colors", advancedVisualsEnabled ? (highContrast ? "bg-white" : "bg-black") : "bg-gray-300")}>
                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", advancedVisualsEnabled ? "right-1" : "left-1", highContrast && advancedVisualsEnabled && "bg-black")} />
                        </div>
                     </button>
                   </div>
                 </SettingItem>
                 
                  <SettingItem label={t.appearance}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-black uppercase opacity-60 ml-1">{t.colorblindMode}</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map(mode => (
                            <button 
                              key={mode} 
                              onClick={() => { setColorblindMode(mode); saveSettings('colorblindMode', mode); }}
                              className={cn(
                                "p-3 border-4 border-black rounded-xl font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all",
                                colorblindMode === mode ? getThemeColor() : (highContrast ? "bg-zinc-900 border-zinc-700" : "bg-gray-100")
                              )}
                            >
                              {t.colorblindTypes[mode]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => { setIsDarkMode(!isDarkMode); saveSettings('darkMode', !isDarkMode); }} 
                       className={cn(
                         "w-full p-4 sm:p-6 border-4 border-black rounded-2xl flex items-center justify-between font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all", 
                         isDarkMode ? "bg-zinc-800 text-white" : "bg-white text-black"
                       )}
                     >
                       <div className="flex items-center gap-3">
                         {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
                         {t.darkMode}
                       </div>
                       <div className={cn("w-12 h-6 rounded-full relative transition-colors", isDarkMode ? "bg-green-500" : "bg-gray-300")}>
                           <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isDarkMode ? "right-1" : "left-1")} />
                       </div>
                     </button>

                     <button 
                       onClick={() => { setHighContrast(!highContrast); saveSettings('highContrast', !highContrast); }} 
                       className={cn(
                         "w-full p-4 sm:p-6 border-4 border-black rounded-2xl font-black text-lg sm:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all", 
                         highContrast ? "bg-white text-black border-white" : "bg-black text-yellow-400"
                       )}
                     >
                       {highContrast ? t.highContrastDisable : t.highContrastEnable}
                     </button>
                   </div>
                 </SettingItem>

                 <SettingItem label={t.themeColors}>
                   <div className="flex gap-4 sm:gap-6 flex-wrap">
                     {(['Amarelo', 'Azul', 'Verde', 'Roxo'] as const).map((tName, i) => {
                       const colors = ['yellow', 'blue', 'green', 'purple'] as const;
                       const theme = colors[i];
                       return (
                         <button 
                           key={theme} 
                           aria-label={`Mudar tema para ${tName}`}
                           onClick={() => setSystemTheme(theme)} 
                           className={cn(
                             "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:scale-90", 
                             theme === 'yellow' ? 'bg-yellow-400' : theme === 'blue' ? 'bg-blue-400' : theme === 'green' ? 'bg-green-400' : 'bg-purple-500',
                             systemTheme === theme && "ring-4 ring-offset-4 ring-black scale-110"
                           )} 
                         />
                       );
                     })}
                   </div>
                 </SettingItem>

                 <SettingItem label={t.operation}>
                   <button onClick={() => { setIsAssistiveMode(!isAssistiveMode); saveSettings('assistiveMode', !isAssistiveMode); }} className={cn("w-full p-4 sm:p-6 border-4 border-black rounded-2xl flex items-center justify-between font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", isAssistiveMode ? "bg-green-400 text-black" : (highContrast ? "bg-zinc-900 border-zinc-700 text-zinc-400" : "bg-gray-100 text-gray-500"))}>
                      <span>{isAssistiveMode ? t.assistiveMode : t.directMode}</span>
                      <div className={cn("w-12 h-6 rounded-full relative transition-colors", isAssistiveMode ? (highContrast ? "bg-white" : "bg-black") : "bg-gray-300")}>
                          <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm", isAssistiveMode ? "right-1" : "left-1", highContrast && isAssistiveMode && "bg-black")} />
                      </div>
                   </button>
                 </SettingItem>

                 <SettingItem label={t.permanentLauncher}>
                   <button onClick={() => setShowPinGuide(true)} className={cn("w-full p-4 sm:p-6 border-4 border-black rounded-2xl flex items-center justify-between font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-pink-400 text-white")}>
                      <div className="flex items-center gap-3"><Plus aria-hidden="true" /> {t.howToPin}</div>
                      <ArrowLeft className="rotate-180" />
                   </button>
                 </SettingItem>
               </div>

               <button 
                 onClick={() => setShowSettings(false)} 
                 className={cn(
                   "w-full py-5 sm:py-6 mt-8 border-4 border-black rounded-2xl font-black text-xl sm:text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all", 
                   getThemeColor()
                 )}
               >
                 {t.done}
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function AppButton({ id, icon, label, color, onClick, onDelete, highContrast, isDarkMode, fontSizeClass, isHovered, themeColor }: any) {
  return (
    <div className="relative h-full aspect-square sm:aspect-auto">
      <button 
        id={id} 
        onClick={onClick} 
        className={cn(
          "w-full h-full p-3 sm:p-6 rounded-[32px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center transition-all", 
          isHovered 
            ? (highContrast ? "bg-white text-black" : themeColor.concat(" scale-105")) 
            : (highContrast ? "bg-zinc-900 border-zinc-700 text-white" : (isDarkMode ? "bg-zinc-800 border-black text-white" : color))
        )}
      >
        <div className="mb-2 sm:mb-4 scale-75 sm:scale-100">{icon}</div>
        <span className={cn("font-black uppercase tracking-tight text-center leading-tight sm:leading-normal", fontSizeClass)}>{label}</span>
      </button>
      <button 
        aria-label={`Remover aplicativo ${label}`}
        onClick={(e) => onDelete(id, e)} 
        className={cn(
          "absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-black flex items-center justify-center transition-transform active:scale-95",
          highContrast || isDarkMode ? "bg-red-600 text-white" : "bg-red-500 text-white"
        )}
      >
        <X size={16} className="sm:w-[20px] sm:h-[20px]" strokeWidth={4} aria-hidden="true" />
      </button>
    </div>
  );
}

function NavButton({ id, icon, label, onClick, highContrast, isDarkMode, fontSizeClass, isHovered, themeColor }: any) {
  return (
    <button 
      id={id} 
      onClick={onClick} 
      className={cn(
        "flex-1 flex flex-col items-center justify-center transition-colors duration-300", 
        isHovered 
          ? (highContrast ? "bg-white text-black" : themeColor) 
          : (highContrast ? "bg-black text-white" : (isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-black"))
      )}
    >
      <div className={cn("transition-transform", isHovered && "scale-110")}>{icon}</div>
      <span className={cn("font-black uppercase mt-1", fontSizeClass)}>{label}</span>
    </button>
  );
}

function CommandSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-black text-lg uppercase border-b-2 border-black mb-4 pb-1">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function CommandLine({ label, cmd, short }: { label: string, cmd: string, short?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-gray-50 border-2 border-black/5 hover:border-black/20 transition-all">
      <div>
        <span className="block text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">{label}</span>
        <span className="font-black text-sm">{cmd}</span>
      </div>
      {short && (
        <div className="bg-yellow-400 text-black px-3 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase shrink-0 self-center">
          Dica: "{short}"
        </div>
      )}
    </div>
  );
}

function SettingItem({ label, children }: any) {
  return (
    <div>
      <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-3">{label}</h3>
      {children}
    </div>
  );
}
