import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
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
  AlertCircle,
  Type,
  CheckCircle,
  HeartPulse,
  LayoutGrid,
  Youtube,
  Facebook,
  Instagram,
  Camera,
  Heart,
  Calculator,
  Calendar,
  Mail,
  Info,
  Flashlight
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

interface ExternalApp {
  id: string;
  name: string;
  icon: React.ReactNode;
  packageName: string;
  color: string;
}

// --- Digital Clock Sub-component for performance ---
const DigitalClock = ({ language, themeMode, THEMES, customTheme }: { language: string, themeMode: string, THEMES: any, customTheme: any }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn(
      "flex-1 flex flex-col items-center justify-center text-center border-[4px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-4 sm:px-8 py-2 rounded-[24px] min-w-0 transition-colors",
      themeMode === 'custom' ? "bg-white border-black text-black" : (THEMES[themeMode]?.uiBg + " " + THEMES[themeMode]?.cardBorder + " " + THEMES[themeMode]?.text)
    )} onClick={() => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }}
    style={themeMode === 'custom' ? {borderColor: customTheme.fg, color: customTheme.fg, backgroundColor: customTheme.accent} : (themeMode !== 'default' ? {boxShadow: `6px 6px 0px 0px ${THEMES[themeMode]?.shadow}`} : {})}
    >
      <span className="font-black text-3xl sm:text-5xl tracking-tighter leading-none truncate w-full">
        {time.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
      </span>
      <span className="font-black text-[9px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] opacity-80 truncate w-full">
        {time.toLocaleDateString(language, { weekday: 'short', day: '2-digit', month: 'short' })}
      </span>
    </div>
  );
};

export default function App() {
  const VERSION = "1.1.0";
  // --- Theme States ---
  type Language = 'pt-BR' | 'en-US' | 'es-ES';
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('launcher_language') as Language) || 'pt-BR');
  
  type ThemePreset = 'default' | 'classic' | 'inverted' | 'night' | 'solar' | 'custom';
  const [themeMode, setThemeMode] = useState<ThemePreset>(() => {
    if (window.matchMedia('(prefers-contrast: more)').matches) return 'classic';
    const saved = localStorage.getItem('launcher_themeMode');
    const validThemes: ThemePreset[] = ['default', 'classic', 'inverted', 'night', 'solar', 'custom'];
    return (validThemes.includes(saved as ThemePreset) ? saved : 'default') as ThemePreset;
  });

  const [customTheme, setCustomTheme] = useState(() => {
    const saved = localStorage.getItem('launcher_customTheme');
    return saved ? JSON.parse(saved) : { bg: '#e5e7eb', fg: '#000000', accent: '#facc15' };
  });

  // --- Accessibility States ---
  const [fontSize, setFontSize] = useState<number>(() => parseInt(localStorage.getItem('launcher_fontSize') || '22'));
  const [isDarkMode, setIsDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [highContrastMode, setHighContrastMode] = useState(() => window.matchMedia('(prefers-contrast: more)').matches);
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [colorblindMode, setColorblindMode] = useState(() => false);
  const [lockEdit, setLockEdit] = useState(() => localStorage.getItem('launcher_lockEdit') === 'true');
  const [vibrateOnTouch, setVibrateOnTouch] = useState(() => localStorage.getItem('launcher_vibrateOnTouch') !== 'false');
  const [readingLine, setReadingLine] = useState(false);
  const [flashAlert, setFlashAlert] = useState(false);
  const [confirmCall, setConfirmCall] = useState(() => localStorage.getItem('launcher_confirmCall') === 'true');
  const [trackpadEnabled, setTrackpadEnabled] = useState(() => localStorage.getItem('launcher_trackpadEnabled') !== 'false');
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('launcher_voiceEnabled') !== 'false');
  const [enhancedFeedback, setEnhancedFeedback] = useState(() => localStorage.getItem('launcher_enhancedFeedback') !== 'false');
  const [showCursor, setShowCursor] = useState(() => localStorage.getItem('launcher_showCursor') !== 'false');
  
  // Listen to system changes
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      setIsDarkMode(darkModeQuery.matches);
      setReduceMotion(motionQuery.matches);
      
      if (contrastQuery.matches) {
        setHighContrastMode(true);
        setThemeMode('classic');
      } else {
        setHighContrastMode(false);
        // We don't force back to 'default' if the user chose something else
        // but if they were in high contrast and it turned off, it's safer to revert or keep
      }
    };

    darkModeQuery.addEventListener('change', handleChange);
    contrastQuery.addEventListener('change', handleChange);
    motionQuery.addEventListener('change', handleChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleChange);
      contrastQuery.removeEventListener('change', handleChange);
      motionQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const TRANSLATIONS = {
    'pt-BR': {
      appName: "ACESSO LIVRE",
      navBack: "VOLTAR",
      navHelp: "AJUDA",
      navHome: "INÍCIO",
      navMenu: "MENU",
      allApps: "TODOS OS APPS",
      add: "ADICIONAR",
      accessibility: "Acessibilidade",
      vision: "Visual",
      hearing: "Audição",
      motor: "Movimento",
      help: "Ajuda",
      close: "FECHAR",
      cancel: "CANCELAR",
      save: "SALVAR ESTILO",
      increaseText: "Aumentar Texto",
      magnifier: "Modo Lupa",
      readingLine: "Linha de Leitura",
      themes: "Temas de Contraste",
      customCores: "Personalizar Cores",
      voiceActive: "Voz Ativa",
      voiceInactive: "Voz Morda",
      visualFeedback: "Feedback Visual",
      vibrateTouch: "Vibrar ao Toque",
      flashAlert: "Flash de Alerta",
      trackpad: "Trackpad",
      setup: "MODO CONFIGURAÇÃO",
      configMode: "MODO CONFIGURAÇÃO",
      confirmCall: "Confirmar Ligação",
      dwell: "Clique Automático",
      medicalInfo: "Ficha Médica",
      whereAmI: "Onde Estou?",
      disabled: "DESATIVADO",
      flashlightOn: "Lanterna Ligada",
      flashlightOff: "Lanterna Desligada",
      medicalTitle: "Ficha Médica de Emergência",
      medicalBlood: "Tipo Sanguíneo",
      medicalAllergies: "Alergias",
      medicalMedications: "Medicamentos",
      medicalContact: "Contato de Emergência",
      medicalName: "Nome",
      medicalPhone: "Fone",
      addAppTitle: "Adicionar Aplicativo",
      // Apps
      phone: "TELEFONE",
      whatsapp: "WHATSAPP",
      camera: "CÂMERA",
      browser: "INTERNET",
      emergency: "EMERGÊNCIA",
      family: "FAMÍLIA",
      youtube: "YOUTUBE",
      facebook: "FACEBOOK",
      instagram: "INSTAGRAM",
      calc: "CALCULADORA",
      gallery: "GALERIA",
      email: "E-MAIL",
      maps: "MAPS",
      // Feedback
      opened: "Abrindo",
      added: "Adicionado",
      removed: "Removido com sucesso",
      accOpened: "Menu de Acessibilidade aberto",
      lupaOn: "Lupa ativada. Use o trackpad para navegar.",
      themeActivated: "Tema ativado",
      customThemeOn: "Personalização ativada",
      colorsSaved: "Cores salvas",
      voiceOn: "Voz ativada",
      voiceOff: "Voz desativada",
      visualFeedbackOn: "Feedback visual ativado",
      visualFeedbackOff: "Feedback visual reduzido",
      vibrating: "Vibrar ao tocar",
      trackpadOn: "Trackpad ativado",
      trackpadOff: "Trackpad desativado",
      lockOn: "Modo Configuração Desativado",
      lockOff: "Modo Configuração Ativado",
      dwellOn: "Dwell ativado",
      dwellOff: "Dwell desativado",
      locating: "Consultando sua localização atual...",
      locationUnknown: "Não consegui identificar o endereço exato agora.",
      locationDenied: "Permissão de localização negada.",
      confirmCallMsg: "Confirme se deseja ligar.",
      assistantOff: "Assistente desativado",
      assistantOn: "ASSISTENTE ATIVO",
      systemTitle: "SISTEMA",
      configLocked: "Configurações Travadas",
      configUnlocked: "Configurações Liberadas",
      showCursor: "Seta Virtual"
    },
    'en-US': {
      appName: "FREE ACCESS",
      navBack: "BACK",
      navHelp: "HELP",
      navHome: "HOME",
      navMenu: "MENU",
      allApps: "ALL APPS",
      add: "ADD",
      accessibility: "Accessibility",
      vision: "Vision",
      hearing: "Hearing",
      motor: "Motor",
      help: "Help",
      close: "CLOSE",
      cancel: "Cancel",
      save: "Save Style",
      increaseText: "Increase Text",
      magnifier: "Magnifier Mode",
      readingLine: "Reading Line",
      themes: "Contrast Themes",
      customCores: "Custom Colors",
      voiceActive: "Voice On",
      voiceInactive: "Voice Off",
      visualFeedback: "Visual Feedback",
      vibrateTouch: "Vibrate on Touch",
      flashAlert: "Flash Alert",
      trackpad: "Trackpad",
      setup: "SETUP MODE",
      confirmCall: "Confirm Call",
      dwell: "Dwell",
      medicalInfo: "Medical Info",
      whereAmI: "Where Am I?",
      disabled: "DISABLED",
      flashlightOn: "Flashlight On",
      flashlightOff: "Flashlight Off",
      medicalTitle: "Emergency Medical Info",
      medicalBlood: "Blood Type",
      medicalAllergies: "Allergies",
      medicalMedications: "Medications",
      medicalContact: "Emergency Contact",
      medicalName: "Name",
      medicalPhone: "Phone",
      addAppTitle: "Add Application",
      // Apps
      phone: "PHONE",
      whatsapp: "WHATSAPP",
      camera: "CAMERA",
      browser: "INTERNET",
      emergency: "EMERGENCY",
      family: "FAMILY",
      youtube: "YOUTUBE",
      facebook: "FACEBOOK",
      instagram: "INSTAGRAM",
      calc: "CALCULATOR",
      gallery: "GALLERY",
      email: "E-MAIL",
      maps: "MAPS",
      // Feedback
      opened: "Opening",
      added: "Added",
      removed: "Successfully removed",
      accOpened: "Accessibility menu opened",
      lupaOn: "Magnifier on. Use trackpad to navigate.",
      themeActivated: "Theme activated",
      customThemeOn: "Customization activated",
      colorsSaved: "Colors saved",
      voiceOn: "Voice enabled",
      voiceOff: "Voice disabled",
      visualFeedbackOn: "Visual feedback enabled",
      visualFeedbackOff: "Visual feedback reduced",
      vibrating: "Vibrate on touch",
      trackpadOn: "Trackpad enabled",
      trackpadOff: "Trackpad disabled",
      lockOn: "Editing locked",
      lockOff: "Editing unlocked",
      dwellOn: "Dwell enabled",
      dwellOff: "Dwell disabled",
      locating: "Checking your current location...",
      locationUnknown: "Could not identify exact address now.",
      locationDenied: "Location permission denied.",
      confirmCallMsg: "Please confirm call.",
      assistantOff: "Assistant off",
      assistantOn: "Listening now...",
      showCursor: "Virtual Cursor"
    },
    'es-ES': {
      appName: "ACCESO LIBRE",
      navBack: "VOLVER",
      navHelp: "AYUDA",
      navHome: "INICIO",
      navMenu: "MENÚ",
      allApps: "TODAS APPS",
      add: "AÑADIR",
      accessibility: "Accesibilidad",
      vision: "Visión",
      hearing: "Audición",
      motor: "Motora",
      help: "Ayuda",
      close: "CERRAR",
      cancel: "Cancelar",
      save: "Guardar Estilo",
      increaseText: "Aumentar Texto",
      magnifier: "Modo Lupa",
      readingLine: "Línea Lectura",
      themes: "Temas Contraste",
      customCores: "Personalizar Colores",
      voiceActive: "Voz Activa",
      voiceInactive: "Voz Inactiva",
      visualFeedback: "Feedback Visual",
      vibrateTouch: "Vibrar al Tocar",
      flashAlert: "Flash Alerta",
      trackpad: "Trackpad",
      setup: "MODO CONFIG",
      confirmCall: "Confirmar Llamada",
      dwell: "Dwell",
      medicalInfo: "Ficha Médica",
      whereAmI: "¿Dónde Estoy?",
      disabled: "DESACTIVADO",
      flashlightOn: "Linterna encendida",
      flashlightOff: "Linterna apagada",
      medicalTitle: "Ficha Médica de Emergencia",
      medicalBlood: "Grupo Sanguíneo",
      medicalAllergies: "Alergias",
      medicalMedications: "Medicamentos",
      medicalContact: "Contacto Emergencia",
      medicalName: "Nombre",
      medicalPhone: "Tel",
      addAppTitle: "Añadir Aplicación",
      // Apps
      phone: "TELÉFONO",
      whatsapp: "WHATSAPP",
      camera: "CÁMARA",
      browser: "INTERNET",
      emergency: "EMERGENCIA",
      family: "FAMILIA",
      youtube: "YOUTUBE",
      facebook: "FACEBOOK",
      instagram: "INSTAGRAM",
      calc: "CALCULADORA",
      gallery: "GALERÍA",
      email: "E-MAIL",
      maps: "MAPS",
      // Feedback
      opened: "Abriendo",
      added: "Añadido",
      removed: "Eliminado con éxito",
      accOpened: "Menú de accesibilidad abierto",
      lupaOn: "Lupa activa. Usa el trackpad.",
      themeActivated: "Tema activado",
      customThemeOn: "Personalización activa",
      colorsSaved: "Colores guardados",
      voiceOn: "Voz activa",
      voiceOff: "Voz inactiva",
      visualFeedbackOn: "Feedback visual activo",
      visualFeedbackOff: "Feedback visual reducido",
      vibrating: "Vibrar al tocar",
      trackpadOn: "Trackpad activo",
      trackpadOff: "Trackpad inactivo",
      lockOn: "Edición bloqueada",
      lockOff: "Edición liberada",
      dwellOn: "Dwell activo",
      dwellOff: "Dwell inactivo",
      locating: "Consultando su ubicación...",
      locationUnknown: "No pude identificar la dirección.",
      locationDenied: "Permiso denegado.",
      confirmCallMsg: "Confirme la llamada.",
      assistantOff: "Asistente inactivo",
      assistantOn: "Escuchando...",
      showCursor: "Flecha Virtual"
    }
  };

  // --- System Initialization (Force Hide Mouse & Absolute Touch) ---
  useEffect(() => {
    // Force hide native pointer and block context menus
    document.body.style.cursor = 'none';
    const handleNoContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleNoContext);

    // Disable default focus behavior on touch to prevent "Snap-to-Element"
    const handleTouchStart = () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('contextmenu', handleNoContext);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  const t = TRANSLATIONS[language];

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('launcher_language', lang);
    triggerHaptic([50]);
    // Synthesis check happens in speak()
  };

  useEffect(() => {
    // Speak switch notice when language changes
    const msg = language === 'en-US' ? 'Language switched to English' : language === 'es-ES' ? 'Idioma cambiado a español' : 'Idioma alterado para Português';
    speak(msg);
  }, [language]);

  // --- Theme Configuration ---
  const THEMES: Record<ThemePreset, { bg: string, text: string, cardBorder: string, shadow: string, name: string, uiBg: string, accentText: string }> = {
    default: { 
      bg: isDarkMode ? 'bg-[#111821]' : 'bg-[#e5e7eb]', 
      text: isDarkMode ? 'text-white' : 'text-black', 
      cardBorder: isDarkMode ? 'border-white' : 'border-black', 
      shadow: isDarkMode ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)', 
      name: 'Padrão', 
      uiBg: isDarkMode ? 'bg-[#1e293b]' : 'bg-white', 
      accentText: isDarkMode ? 'text-white' : 'text-black' 
    },
    classic: { bg: 'bg-black', text: 'text-[#facc15]', cardBorder: 'border-[#facc15]', shadow: '#facc15', name: 'Clássico', uiBg: 'bg-black', accentText: 'text-[#facc15]' },
    inverted: { bg: 'bg-white', text: 'text-black', cardBorder: 'border-black', shadow: 'rgba(0,0,0,1)', name: 'Invertido', uiBg: 'bg-white', accentText: 'text-black' },
    night: { bg: 'bg-[#0f172a]', text: 'text-[#38bdf8]', cardBorder: 'border-[#38bdf8]', shadow: '#38bdf8', name: 'Noturno', uiBg: 'bg-[#1e293b]', accentText: 'text-[#38bdf8]' },
    solar: { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', cardBorder: 'border-[#92400e]', shadow: '#92400e', name: 'Solar', uiBg: 'bg-[#fffbeb]', accentText: 'text-[#92400e]' },
    custom: { bg: '', text: '', cardBorder: '', shadow: '', name: 'Customizado', uiBg: '', accentText: '' }
  };

  const THEME_NAMES: Record<Language, Record<ThemePreset, string>> = {
    'pt-BR': { default: 'Padrão', classic: 'Clássico', inverted: 'Invertido', night: 'Noturno', solar: 'Solar', custom: 'Customizado' },
    'en-US': { default: 'Default', classic: 'Classic', inverted: 'Inverted', night: 'Night', solar: 'Solar', custom: 'Custom' },
    'es-ES': { default: 'Predeterminado', classic: 'Clásico', inverted: 'Invertido', night: 'Nocturno', solar: 'Solar', custom: 'Personalizado' }
  };

  const getThemeStyles = () => {
    if (themeMode === 'custom') {
      return {
        background: { backgroundColor: customTheme.bg },
        text: { color: customTheme.fg },
        border: { borderColor: customTheme.fg },
        shadowColor: customTheme.fg
      };
    }
    const t = THEMES[themeMode] || THEMES.default;
    return {
      background: {}, // Handled by tailwind classes
      text: { color: 'inherit' }, // Use classes for non-custom
      border: {},
      shadowColor: t.shadow
    };
  };

  const currentThemeStyles = getThemeStyles();
  
  const iconThemeColor = themeMode === 'custom' 
    ? customTheme.fg 
    : (themeMode === 'default' ? 'currentColor' : undefined); // undefined lets tailwind classes handle it
  
  // --- UI States ---
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAppList, setShowAppList] = useState(false);
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [locationText, setLocationText] = useState("");

  // --- Core States & Refs ---
  const cursorPosRef = useRef({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [dwellEnabled, setDwellEnabled] = useState(true);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  const toggleFlashlight = async () => {
    const newState = !flashlightOn;
    setFlashlightOn(newState);
    triggerHaptic([50]);
    speak(newState ? t.flashlightOn : t.flashlightOff);

    try {
      if (newState) {
        // Try environment camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: { ideal: "environment" } } 
        });
        
        const track = stream.getVideoTracks()[0];
        videoTrackRef.current = track;

        // Apply torch
        try {
          const capabilities = track.getCapabilities() as any;
          if (capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: true }]
            } as any);
          } else {
            // Some browsers don't show torch in capabilities until track is active or at all
            await track.applyConstraints({
              advanced: [{ torch: true }]
            } as any).catch(e => console.warn("Apply constraints torch failed:", e));
          }
        } catch (e) {
          console.warn("Could not check capabilities:", e);
        }
      } else {
        if (videoTrackRef.current) {
          videoTrackRef.current.stop();
          videoTrackRef.current = null;
        }
      }
    } catch (err) {
      console.error("Flashlight hardware error:", err);
    }
  };

  const HEADER_HEIGHT = 130;
  const FOOTER_HEIGHT = 112;

  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dwellProgressRef = useRef(0);

  // --- Animation ---
  const cursorX = useMotionValue(50);
  const cursorY = useMotionValue(50);

  const cursorLeft = useTransform(cursorX, [0, 100], ["0vw", "100vw"]);
  const cursorTop = useTransform(cursorY, [0, 100], ["0dvh", "100dvh"]);

  // --- Utilities ---
  const triggerHaptic = (pattern: number[]) => {
    if (vibrateOnTouch && 'vibrate' in navigator) navigator.vibrate(pattern);
  };

  const speak = (text: string) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFlash = () => {
    setFlashAlert(true);
    setTimeout(() => setFlashAlert(false), 500);
    triggerHaptic([100, 100, 100]);
  };

  const handleWhereAmI = async () => {
    speak(t.locating);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const address = data.display_name || (language === 'pt-BR' ? "Local desconhecido" : (language === 'es-ES' ? "Ubicación desconocida" : "Unknown location"));
          setLocationText(address);
          speak(`${language === 'en-US' ? 'You are at' : (language === 'es-ES' ? 'Estás en' : 'Você está na')}: ${address}`);
        } catch (err) {
          speak(t.locationUnknown);
        }
      }, () => speak(t.locationDenied));
    }
  };

  // --- App Presets & Management ---
  const PRESET_APPS: Record<string, { label: string, color: string, icon: React.ReactNode, type: 'intent' | 'link' | 'tel', value: string }> = useMemo(() => ({
    'phone': { label: t.phone, color: 'bg-[#22c55e]', icon: <Phone size={52} strokeWidth={3} />, type: 'tel', value: 'tel:' },
    'whatsapp': { label: t.whatsapp, color: 'bg-[#10b981]', icon: <MessageSquare size={52} strokeWidth={3} />, type: 'intent', value: 'whatsapp://send' },
    'camera': { label: t.camera, color: 'bg-blue-400', icon: <Camera size={52} strokeWidth={3} />, type: 'intent', value: 'intent:#Intent;action=android.media.action.STILL_IMAGE_CAMERA;end' },
    'browser': { label: t.browser, color: 'bg-[#f97316]', icon: <Search size={52} strokeWidth={3} />, type: 'intent', value: 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_BROWSER;end' },
    'emergency': { label: t.emergency, color: 'bg-red-600', icon: <AlertCircle size={52} strokeWidth={3} />, type: 'tel', value: 'tel:190' },
    'family': { label: t.family, color: 'bg-purple-600', icon: <Heart size={52} strokeWidth={3} />, type: 'link', value: '#' },
    'youtube': { label: t.youtube, color: 'bg-red-500', icon: <Youtube size={52} strokeWidth={3} />, type: 'intent', value: 'com.google.android.youtube' },
    'facebook': { label: t.facebook, color: 'bg-blue-600', icon: <Facebook size={52} strokeWidth={3} />, type: 'intent', value: 'com.facebook.katana' },
    'instagram': { label: t.instagram, color: 'bg-pink-500', icon: <Instagram size={52} strokeWidth={3} />, type: 'intent', value: 'com.instagram.android' },
    'gallery': { label: t.gallery, color: 'bg-yellow-400', icon: <LayoutGrid size={52} strokeWidth={3} />, type: 'intent', value: 'com.android.gallery3d' },
    'maps': { label: t.maps, color: 'bg-green-500', icon: <MapPin size={52} strokeWidth={3} />, type: 'intent', value: 'com.google.android.apps.maps' },
  }), [t]);

  const [visibleAppIds, setVisibleAppIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('launcher_visibleApps');
    return saved ? JSON.parse(saved) : ['phone', 'whatsapp', 'camera', 'gallery', 'emergency', 'family'];
  });

  const addApp = useCallback((id: string) => {
    if (!visibleAppIds.includes(id)) {
      const newIds = [...visibleAppIds, id];
      setVisibleAppIds(newIds);
      localStorage.setItem('launcher_visibleApps', JSON.stringify(newIds));
      triggerHaptic([50]);
      speak(`${t.added} ${PRESET_APPS[id].label}`);
    }
    setShowAddAppModal(false);
  }, [visibleAppIds, t, PRESET_APPS, speak, triggerHaptic]);

  const removeApp = useCallback((id: string) => {
    const newIds = visibleAppIds.filter(appId => appId !== id);
    setVisibleAppIds(newIds);
    localStorage.setItem('launcher_visibleApps', JSON.stringify(newIds));
    triggerHaptic([100]);
    speak(t.removed);
  }, [visibleAppIds, t, speak, triggerHaptic]);

  const handleAppAction = useCallback((id: string) => {
    const app = PRESET_APPS[id];
    if (!app) return;

    triggerHaptic([50]);
    speak(`${t.opened} ${app.label}`);

    if (app.type === 'link') {
      if (app.value === '#') return;
      window.location.href = app.value;
    } else if (app.type === 'tel') {
      window.location.href = app.value;
    } else {
      // Android Intent Logic
      if (app.value.includes('intent:')) {
        window.location.href = app.value;
      } else {
        window.location.href = `intent://#Intent;package=${app.value};scheme=https;end`;
      }
    }
  }, [PRESET_APPS, speak, triggerHaptic, t]);

  const allApps: AppData[] = useMemo(() => [
    ...visibleAppIds.map(id => ({
      id,
      label: PRESET_APPS[id].label,
      color: PRESET_APPS[id].color,
      icon: PRESET_APPS[id].icon,
      action: () => handleAppAction(id)
    })),
    // Fixed "Todos os Apps" button
    { 
      id: 'app-all', label: t.allApps, color: 'bg-zinc-100', 
      icon: <LayoutGrid size={52} strokeWidth={3} />,
      action: () => { 
        triggerHaptic([50]);
        speak(t.opened + " " + t.allApps);
        window.location.href = 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end';
      }
    }
  ], [visibleAppIds, PRESET_APPS, handleAppAction, t, triggerHaptic, speak]);

  // --- Voice Commands Logic ---
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = language;

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        speak(t.locationDenied || "Permissão de microfone negada.");
        setIsVoiceActive(false);
      }
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      handleVoiceCommand(transcript);
    };

    recognitionRef.current.onend = () => {
      if (isVoiceActive) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log("Recognition restart suppressed:", e);
        }
      }
    };

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [language]);

  useEffect(() => {
    if (isVoiceActive) {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Speech recognition error:", e);
      }
    } else {
      recognitionRef.current?.stop();
    }
  }, [isVoiceActive]);

  const handleVoiceCommand = (cmd: string) => {
    console.log("Command received:", cmd);
    
    // Normalize command strings for different languages
    const tokens = cmd.split(' ');
    
    // Scroll Commands
    if (cmd.includes('descer') || cmd.includes('down') || cmd.includes('bajar')) {
      const el = document.getElementById('main-scroll-area');
      if (el) el.scrollBy({ top: 300, behavior: 'smooth' });
      speak(language === 'pt-BR' ? 'Descendo' : (language === 'es-ES' ? 'Bajando' : 'Scrolling down'));
    }
    else if (cmd.includes('subir') || cmd.includes('up') || cmd.includes('arriba')) {
      const el = document.getElementById('main-scroll-area');
      if (el) el.scrollBy({ top: -300, behavior: 'smooth' });
      speak(language === 'pt-BR' ? 'Subindo' : (language === 'es-ES' ? 'Subiendo' : 'Scrolling up'));
    }
    // Zoom Commands
    else if (cmd.includes('aumentar') || cmd.includes('zoom in') || cmd.includes('más')) {
      setFontSize(s => Math.min(48, s + 4));
      speak(language === 'pt-BR' ? 'Aumentando' : (language === 'es-ES' ? 'Aumentando' : 'Zooming in'));
    }
    else if (cmd.includes('diminuir') || cmd.includes('zoom out') || cmd.includes('menos')) {
      setFontSize(s => Math.max(16, s - 4));
      speak(language === 'pt-BR' ? 'Diminuindo' : (language === 'es-ES' ? 'Disminuyendo' : 'Zooming out'));
    }
    // App Launchers
    else if (cmd.includes('abrir') || cmd.includes('open')) {
      const appName = tokens[tokens.length - 1];
      const app = allApps.find(a => a.label.toLowerCase().includes(appName));
      if (app) app.action();
      else speak(language === 'pt-BR' ? `Aplicativo ${appName} não encontrado` : `App ${appName} not found`);
    }
    // Emergency
    else if (cmd.includes('ajuda') || cmd.includes('help') || cmd.includes('socorro') || cmd.includes('auxilio')) {
      handleAppAction('emergency');
    }
    // Offline / System Commands
    else if (cmd.includes('lanterna') || cmd.includes('flashlight') || cmd.includes('luz')) {
      toggleFlashlight();
    }
    else if (cmd.includes('horas') || cmd.includes('time') || cmd.includes('reloj')) {
      const timeStr = new Date().toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });
      speak((language === 'pt-BR' ? 'Agora são ' : (language === 'es-ES' ? 'Son las ' : 'It is ')) + timeStr);
    }
    else if (cmd.includes('bateria') || cmd.includes('battery') || cmd.includes('carga')) {
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          const level = Math.floor(battery.level * 100);
          const msg = (language === 'pt-BR' ? 'Nível de bateria em ' : (language === 'es-ES' ? 'Nivel de batería al ' : 'Battery level at ')) + level + '%';
          speak(msg);
        });
      }
    }
  };

  const handleClick = useCallback(() => {
    setIsClicking(true);
    triggerHaptic([60]);
    setTimeout(() => setIsClicking(false), 200);

    const { x, y } = cursorPosRef.current;
    const xPx = (x / 100) * window.innerWidth;
    const yPx = (y / 100) * window.innerHeight;
    const el = document.elementFromPoint(xPx, yPx);
    
    if (el) {
      const target = el.closest('button') || el.closest('a') || el.closest('[role="button"]') || el.closest('[role="listitem"]');
      if (target) (target as HTMLElement).click();
    }
  }, [triggerHaptic]);

  const trackpadRef = useRef<HTMLDivElement>(null);

  const handleTrackpadInteraction = useCallback((clientX: number, clientY: number) => {
    if (!trackpadRef.current) return;
    const rect = trackpadRef.current.getBoundingClientRect();
    
    // Direct absolute mapping (0 to 100%) - GPU Accelerated
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    const newX = Math.max(0, Math.min(100, x));
    const newY = Math.max(0, Math.min(100, y));
    
    cursorPosRef.current = { x: newX, y: newY };
    cursorX.set(newX);
    cursorY.set(newY);
  }, [cursorX, cursorY]);

  const onPointerDown = (e: React.PointerEvent) => {
    // Essential for Android: captures coordinates even if finger slides outside
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    handleTrackpadInteraction(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    // If the pointer is down (buttons > 0) or it's a touch (pointerType === 'touch')
    if (e.buttons > 0 || e.pointerType === 'touch') {
      handleTrackpadInteraction(e.clientX, e.clientY);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    // Current time is handled by DigitalClock component
  }, []);

  // Detection loop for accessibility - throttled for performance
  useEffect(() => {
    const checkHover = () => {
      const { x, y } = cursorPosRef.current;
      const xPx = (x / 100) * window.innerWidth;
      const yPx = (y / 100) * window.innerHeight;
      
      const el = document.elementFromPoint(xPx, yPx);
      const target = el?.closest('button') || el?.closest('a') || el?.closest('[role="listitem"]');
      const elementId = target?.id || (target as any)?.dataset?.appId || null;

      if (elementId && elementId !== hoveredId && !elementId.includes('tracks')) {
        setHoveredId(elementId);
        if (vibrateOnTouch) triggerHaptic([5]);
      } else if (!elementId && hoveredId) {
        setHoveredId(hoveredIdRef.current === null ? null : (hoveredIdRef.current = null));
        setHoveredId(null);
      }

      // Dwell logic
      if (dwellEnabled && elementId && !elementId.includes('tracks') && !elementId.includes('mic')) {
        if (dwellTimerRef.current && hoveredIdRef.current === elementId) return;
        if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
        
        hoveredIdRef.current = elementId;
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
          hoveredIdRef.current = null;
        }
      }
    };

    const interval = setInterval(checkHover, 100); // Check every 100ms instead of every frame
    return () => clearInterval(interval);
  }, [dwellEnabled, handleClick, vibrateOnTouch, hoveredId]);

  const hoveredIdRef = useRef<string | null>(null);

  return (
    <div 
      className={cn(
        "fixed inset-0 flex flex-col overflow-hidden select-none font-sans h-[100dvh] w-[100vw] touch-none",
        themeMode !== 'custom' && (THEMES[themeMode]?.bg || THEMES.default.bg),
        themeMode !== 'custom' && (THEMES[themeMode]?.text || THEMES.default.text),
        colorblindMode && "grayscale contrast-125"
      )}
      onClick={() => {
        if (!document.fullscreenElement && (document.documentElement as any).requestFullscreen) {
          (document.documentElement as any).requestFullscreen().catch(() => {});
        }
      }}
      style={{ 
        fontSize: `${fontSize}px`,
        ...(themeMode === 'custom' ? currentThemeStyles.background : {}),
        cursor: 'none'
      }}
    >
      {/* Flash Overlay (Screen Backup) */}
      <AnimatePresence>
        {(flashAlert || flashlightOn) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: flashlightOn ? 0.95 : 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-white z-[3000] pointer-events-none" 
          />
        )}
      </AnimatePresence>

      {/* Reading Line Overlay */}
      {readingLine && (
        <motion.div 
          animate={{ top: `${cursorPosRef.current.y}%` }}
          className={cn(
            "fixed left-0 right-0 h-10 border-y-4 z-[50] pointer-events-none transition-all duration-75",
            themeMode === 'custom' ? "" : (themeMode === 'default' ? "bg-yellow-400/40 border-black" : "bg-white/20")
          )}
          style={themeMode === 'custom' ? { backgroundColor: `${customTheme.accent}40`, borderColor: customTheme.fg } : {}}
        />
      )}

      {/* Header - Relógio e Data (Neo-Brutalista) */}
      <header className={cn(
        "h-[130px] flex-shrink-0 border-b-[4px] relative px-4 z-[200] flex items-center justify-between gap-2 pt-[env(safe-area-inset-top)]",
        themeMode === 'custom' ? "" : (themeMode === 'default' ? "bg-white border-black text-black" : (THEMES[themeMode]?.bg + " " + THEMES[themeMode]?.cardBorder + " " + THEMES[themeMode]?.text))
      )} style={themeMode === 'custom' ? {borderColor: customTheme.fg, color: customTheme.fg} : {}}>
        
        {/* Lado Esquerdo: Acessibilidade */}
        <div className="flex-shrink-0">
          <button 
            id="access-btn"
            tabIndex={-1}
            onFocus={(e) => e.currentTarget.blur()}
            onClick={() => { setShowAccessModal(true); triggerHaptic([50]); speak(t.accOpened); }}
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all",
              themeMode === 'custom' ? "bg-white border-black" : (themeMode === 'default' ? "bg-yellow-400 border-black" : "bg-transparent")
            )}
            style={themeMode === 'custom' ? {borderColor: customTheme.fg, boxShadow: `4px 4px 0px 0px ${customTheme.fg}`, color: customTheme.fg} : (themeMode !== 'default' ? {boxShadow: `4px 4px 0px 0px ${THEMES[themeMode]?.shadow}`, borderColor: 'currentColor'} : {})}
          >
            <Accessibility size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
          </button>
        </div>

        {/* Centro: RELÓGIO E DATA */}
        <DigitalClock 
          language={language} 
          themeMode={themeMode} 
          THEMES={THEMES} 
          customTheme={customTheme} 
        />

        {/* Lado Direito: Settings */}
        <div className="flex-shrink-0">
          <button 
            id="settings-btn"
            tabIndex={-1}
            onFocus={(e) => e.currentTarget.blur()}
            onClick={() => { setShowSettingsModal(true); triggerHaptic([50]); speak(t.settOpened); }}
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-x-1 transition-all",
              themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-white" : (THEMES[themeMode]?.bg || THEMES.default.bg))
            )}
            style={themeMode === 'custom' ? {borderColor: customTheme.fg, boxShadow: `4px 4px 0px 0px ${customTheme.fg}`} : (themeMode !== 'default' ? {boxShadow: `4px 4px 0px 0px ${THEMES[themeMode]?.shadow}`, borderColor: 'currentColor'} : {})}
          >
            <Settings size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} style={themeMode === 'custom' ? {color: customTheme.fg} : {}} />
          </button>
        </div>
      </header>


      <main 
        id="main-scroll-area"
        className={cn(
          "flex-grow overflow-y-auto p-6 sm:p-12 scroll-smooth relative custom-scrollbar",
          themeMode === 'custom' ? "" : (themeMode === 'default' ? "bg-[#f3f4f6]" : (THEMES[themeMode]?.bg))
        )}
        style={themeMode === 'custom' ? { backgroundColor: customTheme.bg } : {}}
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-12" role="list" aria-label="Lista de aplicativos disponíveis">
          {visibleAppIds.map((id) => (
            <motion.div 
              key={id} 
              id={id}
              onClick={() => handleAppAction(id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleAppAction(id); } }}
              role="listitem"
              aria-label={`Abrir ${PRESET_APPS[id]?.label}`}
              tabIndex={0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, x: 4, y: 4 }}
              className={cn(
                "group relative aspect-square flex flex-col items-center justify-center gap-2 rounded-[32px] border-[4px] transition-all cursor-pointer",
                themeMode === 'custom' ? "" : (themeMode === 'default' ? PRESET_APPS[id]?.color : "bg-transparent"),
                themeMode !== 'custom' ? (THEMES[themeMode]?.cardBorder || "border-black") : ""
              )}
              style={{
                boxShadow: `8px 8px 0px 0px ${themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? 'rgba(0,0,0,1)' : (THEMES[themeMode]?.shadow || 'rgba(0,0,0,1)'))}`,
                ...(themeMode === 'custom' ? { borderColor: customTheme.fg, color: customTheme.fg, backgroundColor: customTheme.accent } : {})
              }}
            >
              <div className="scale-110 mb-1" aria-hidden="true">
                {React.cloneElement(PRESET_APPS[id]?.icon as React.ReactElement, { 
                  color: themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? 'white' : 'currentColor') 
                })}
              </div>
              <span className={cn(
                "font-black text-xl sm:text-2xl uppercase tracking-tighter",
                themeMode === 'default' ? "text-white" : "text-current"
              )} aria-hidden="true">
                {PRESET_APPS[id]?.label}
              </span>
              
              {!lockEdit && (
                <button 
                  id={`del-${id}`}
                  tabIndex={-1}
                  onFocus={(e) => e.currentTarget.blur()}
                  onClick={(e) => { e.stopPropagation(); removeApp(id); }}
                  aria-label={`Remover ${PRESET_APPS[id]?.label}`}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-red-600 text-white rounded-full border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center z-50 active:scale-90"
                >
                  <X size={24} strokeWidth={5} />
                </button>
              )}
            </motion.div>
          ))}
          
          {!lockEdit && (
            <button 
              id="btn-add-app"
              tabIndex={-1}
              onFocus={(e) => e.currentTarget.blur()}
              onClick={() => { setShowAddAppModal(true); triggerHaptic([50]); }}
              aria-label="Adicionar novo aplicativo"
              className="aspect-square flex flex-col items-center justify-center gap-2 rounded-[32px] border-[4px] border-dashed border-black/20 bg-black/5 active:scale-95 transition-all text-black/30 hover:text-black hover:border-black/50"
            >
              <Plus size={52} strokeWidth={4} aria-hidden="true" />
              <span className="font-black text-xl uppercase tracking-widest" aria-hidden="true">{t.add}</span>
            </button>
          )}
        </div>

      </main>

      {/* Navegação e Assistive Controls simplificados para Footer - Mic | Trackpad | Flashlight */}
      <footer className={cn(
        "h-28 flex-shrink-0 border-t-[4px] grid grid-cols-[100px_1fr_100px] z-[100] pb-[env(safe-area-inset-bottom)]",
        themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-white" : (THEMES[themeMode]?.bg || THEMES.default.bg)),
        themeMode !== 'custom' ? (THEMES[themeMode]?.cardBorder || "border-black") : ""
      )} style={themeMode === 'custom' ? {borderColor: customTheme.fg} : {}}>
        
        {/* Lado Esquerdo: MICROFONE */}
        <div className="flex items-center justify-center border-r-[3px] border-current">
          <button 
            id="mic-btn" 
            tabIndex={-1}
            onFocus={(e) => e.currentTarget.blur()}
            onClick={() => { setIsVoiceActive(!isVoiceActive); triggerHaptic([50]); speak(isVoiceActive ? t.assistantOff : t.assistantOn); }} 
            aria-label={isVoiceActive ? "Desativar assistente de voz" : "Ativar assistente de voz"}
            className={cn(
              "w-16 h-16 rounded-full border-[4px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all",
              isVoiceActive ? "bg-red-500 border-black text-white" : (themeMode === 'default' ? "bg-white border-black text-black" : "bg-transparent")
            )}
            style={{
              boxShadow: `4px 4px 0px 0px ${themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? 'rgba(0,0,0,1)' : (THEMES[themeMode]?.shadow || 'rgba(0,0,0,1)'))}`,
              borderColor: themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? 'black' : 'currentColor'),
            }}
          >
            <AnimatePresence>
              {isVoiceActive && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-white/40 rounded-full"
                />
              )}
            </AnimatePresence>
            <Mic size={32} strokeWidth={4} className="relative z-10" aria-hidden="true" />
          </button>
        </div>

        {/* CENTRO: TRACKPAD */}
        <div 
          ref={trackpadRef}
          id="tracks-area"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={handleClick}
          role="region"
          aria-label="Área de controle do cursor (trackpad)"
          className="relative flex items-center justify-center cursor-crosshair group active:bg-black/5 transition-colors touch-none select-none overflow-hidden"
        >
          {trackpadEnabled && (
            <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity" aria-hidden="true">
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
          )}
          
          {/* Progress Dwell Visualizer (Small) */}
          {dwellEnabled && dwellProgress > 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={100} strokeDashoffset={100 - dwellProgress} className="text-current opacity-30" />
              </svg>
            </div>
          )}
        </div>

        {/* Lado Direito: LANTERNA */}
        <div className="flex items-center justify-center border-l-[3px] border-current">
          <button 
            id="flashlight-btn" 
            tabIndex={-1}
            onFocus={(e) => e.currentTarget.blur()}
            onClick={toggleFlashlight} 
            aria-label={flashlightOn ? "Desligar lanterna" : "Ligar lanterna"}
            className={cn(
              "w-16 h-16 rounded-full border-[4px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all",
              flashlightOn ? "bg-yellow-400 border-black text-black" : (themeMode === 'default' ? "bg-gray-100 border-black text-black" : "bg-transparent")
            )}
            style={{
              borderColor: themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? 'black' : 'currentColor'),
              boxShadow: `4px 4px 0px 0px ${themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? 'rgba(0,0,0,1)' : (THEMES[themeMode]?.shadow || 'rgba(0,0,0,1)'))}`,
              color: (flashlightOn || themeMode === 'default') ? 'black' : (themeMode === 'custom' ? customTheme.fg : 'inherit')
            }}
          >
            <Flashlight size={32} strokeWidth={3} aria-hidden="true" />
          </button>
        </div>
      </footer>



      <AnimatePresence>
        {trackpadEnabled && showCursor && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: isClicking ? 0.7 : 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed pointer-events-none z-[1000]" 
            style={{ 
              left: cursorLeft, 
              top: cursorTop, 
              x: "-50%", 
              y: "-50%" 
            }}
          >
            <svg viewBox="0 0 100 100" className="w-[60px] h-[60px] sm:w-[90px] sm:h-[90px] drop-shadow-2xl">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="opacity-50" />
              <circle cx="50" cy="50" r="8" fill="currentColor" />
              <path d="M50 10 L50 30 M50 70 L50 90 M10 50 L30 50 M70 50 L90 50" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility Modal */}
      <AnimatePresence>
        {showAccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-md z-[2000] flex items-center justify-center">
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "w-full h-full flex flex-col transition-colors overflow-hidden",
                themeMode === 'custom' ? "" : (themeMode === 'default' ? "bg-white border-black text-black" : (THEMES[themeMode]?.bg + " " + THEMES[themeMode]?.cardBorder + " " + THEMES[themeMode]?.text))
              )}
              style={themeMode === 'custom' ? { backgroundColor: customTheme.bg, color: customTheme.fg } : {}}
            >
              <div className={cn("p-6 sm:p-8 flex-shrink-0 border-b-[6px] border-black flex items-center justify-between", themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-yellow-400 text-black" : "bg-transparent border-current"))}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center bg-black/10 rounded-[20px] border-[4px] border-black/20">
                    <Accessibility size={32} strokeWidth={3} />
                  </div>
                  <h2 className="font-black text-2xl sm:text-3xl uppercase italic tracking-tighter leading-none">{t.accessibility}</h2>
                </div>
                <button onClick={() => setShowAccessModal(false)} className={cn("p-3 rounded-2xl border-[4px] border-black active:translate-y-1 flex-shrink-0", themeMode === 'custom' ? "bg-transparent" : "bg-white text-black")}><X size={32} strokeWidth={3} /></button>
              </div>
              
              <div className="flex-1 p-6 sm:p-10 overflow-y-auto overflow-x-hidden space-y-12 pb-36 custom-scrollbar box-border">
                {/* CONFIGURAÇÃO / EDIÇÃO */}
                <section className="bg-black/5 p-6 sm:p-8 rounded-[40px] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full box-border">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5 min-w-0 flex-1">
                      <div className={cn("shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", lockEdit ? "bg-zinc-200" : "bg-red-500 text-white")}>
                        {lockEdit ? <Lock size={32} strokeWidth={2.5} /> : <Unlock size={32} strokeWidth={2.5} />}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-black text-xl sm:text-2xl uppercase leading-tight">{t.setup}</h3>
                        <p className="font-bold text-xs sm:text-sm opacity-60 mt-1 uppercase tracking-wider leading-tight">{lockEdit ? "Edição Bloqueada" : "Edição Liberada"}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button 
                        onClick={() => {
                          const newState = !lockEdit;
                          setLockEdit(newState);
                          localStorage.setItem('launcher_lockEdit', String(newState));
                          triggerHaptic([100]);
                          speak(newState ? t.lockOn : t.lockOff);
                        }}
                        className={cn(
                          "w-[88px] h-[52px] rounded-full border-[4px] border-black transition-all relative flex items-center px-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none",
                          lockEdit ? "bg-zinc-300" : "bg-green-400"
                        )}
                      >
                        <motion.div 
                          animate={{ x: lockEdit ? 0 : 36 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="w-10 h-10 bg-white rounded-full border-4 border-black flex items-center justify-center shadow-sm"
                        >
                          <div className={cn("w-2.5 h-2.5 rounded-full", lockEdit ? "bg-zinc-400" : "bg-green-600")} />
                        </motion.div>
                      </button>
                    </div>
                  </div>
                </section>

                {/* VISÃO */}
                <section>
                  <h3 className="font-black text-xs uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2"><Eye size={16}/> {t.vision}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setFontSize(s => Math.min(48, s + 4))} className={cn("min-h-[112px] p-4 rounded-2xl border-[4px] border-black bg-blue-400 flex flex-col items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all")}><ZoomIn size={32} className="text-black" /><span className="font-black uppercase text-[10px] sm:text-xs text-black text-center leading-tight">{t.increaseText}</span></button>
                    <button onClick={() => { setFontSize(s => Math.max(12, s - 4)); triggerHaptic([50]); }} className="min-h-[112px] p-4 rounded-2xl border-[4px] border-black bg-cyan-400 flex flex-col items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"><ZoomOut size={32} className="text-black" /><span className="font-black uppercase text-[10px] sm:text-xs text-black text-center leading-tight">{t.decreaseText}</span></button>
                    <button onClick={() => setReadingLine(!readingLine)} className={cn("min-h-[112px] p-4 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all", readingLine ? "bg-yellow-400 text-black shadow-none translate-y-1" : "bg-zinc-100 text-black")}><Type size={32} /><span className="font-black uppercase text-[10px] sm:text-xs text-center leading-tight">{t.readingLine}</span></button>
                    
                    <button onClick={() => {
                      const newState = !voiceEnabled;
                      setVoiceEnabled(newState);
                      localStorage.setItem('launcher_voiceEnabled', String(newState));
                      triggerHaptic([50]);
                      if (newState) {
                        speak(t.voiceOn);
                      }
                    }} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", voiceEnabled ? "bg-green-400 text-black shadow-none" : "bg-zinc-100 text-black")}>
                      {voiceEnabled ? <Volume2 size={32} /> : <ZapOff size={32} />}
                      <span className="font-black uppercase text-[10px]">{voiceEnabled ? t.voiceActive : t.voiceInactive}</span>
                    </button>
                    <button onClick={() => {
                      const newState = !enhancedFeedback;
                      setEnhancedFeedback(newState);
                      localStorage.setItem('launcher_enhancedFeedback', String(newState));
                      triggerHaptic([50]);
                      speak(newState ? t.visualFeedbackOn : t.visualFeedbackOff);
                    }} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", enhancedFeedback ? "bg-purple-400 text-black shadow-none" : "bg-zinc-100 text-black")}>
                      <Palette size={32} />
                      <span className="font-black uppercase text-[10px]">{t.visualFeedback}</span>
                    </button>
                  </div>
                </section>

                {/* AUDIÇÃO */}
                <section>
                  <h3 className="font-black text-xs uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2"><Volume2 size={16}/> {t.hearing}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setVibrateOnTouch(!vibrateOnTouch)} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", vibrateOnTouch ? "bg-green-400 text-black shadow-none" : "bg-gray-100 text-black")}><Smartphone size={32} /><span className="font-black uppercase text-[10px]">{t.vibrateTouch}</span></button>
                    <button onClick={handleFlash} className="h-28 rounded-2xl border-[4px] border-black bg-yellow-400 flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"><Zap size={32} className="text-black" /><span className="font-black uppercase text-[10px] text-black">{t.flashAlert}</span></button>
                  </div>
                </section>

                {/* MOTORA */}
                <section>
                  <h3 className="font-black text-xs uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2"><Smartphone size={16}/> {t.motor}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => {
                      const newState = !trackpadEnabled;
                      setTrackpadEnabled(newState);
                      localStorage.setItem('launcher_trackpadEnabled', String(newState));
                      triggerHaptic([50]);
                      speak(newState ? t.trackpadOn : t.trackpadOff);
                    }} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black", trackpadEnabled ? "bg-yellow-400 shadow-none text-black" : "bg-gray-100")}>
                      <Maximize2 size={32} />
                      <span className="font-black uppercase text-[10px]">{trackpadEnabled ? `${t.trackpad} On` : `${t.trackpad} Off`}</span>
                    </button>
                    <button onClick={() => setConfirmCall(!confirmCall)} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black", confirmCall ? "bg-green-400 shadow-none" : "bg-gray-100")}><CheckCircle size={32} /><span className="font-black uppercase text-[10px]">{t.confirmCall}</span></button>
                    <button onClick={() => {
                      const newState = !dwellEnabled;
                      setDwellEnabled(newState);
                      localStorage.setItem('launcher_dwellEnabled', String(newState));
                      triggerHaptic([50]);
                      speak(newState ? t.dwellOn : t.dwellOff);
                    }} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black", dwellEnabled ? "bg-cyan-400 shadow-none" : "bg-gray-100")}>
                      <Zap size={32} />
                      <span className="font-black uppercase text-[10px]">{dwellEnabled ? `${t.dwell} On` : `${t.dwell} Off`}</span>
                    </button>
                    {trackpadEnabled && (
                      <button onClick={() => {
                        const newState = !showCursor;
                        setShowCursor(newState);
                        localStorage.setItem('launcher_showCursor', String(newState));
                        triggerHaptic([50]);
                      }} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black", showCursor ? "bg-orange-400 shadow-none" : "bg-gray-100")}>
                        <Smartphone size={32} />
                        <span className="font-black uppercase text-[10px]">{t.showCursor} {showCursor ? 'On' : 'Off'}</span>
                      </button>
                    )}
                  </div>
                </section>

                {/* AJUDA */}
                <section>
                  <h3 className="font-black text-xs uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2"><HelpCircle size={16}/> {t.help}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowMedicalInfo(true)} className="h-28 rounded-2xl border-[4px] border-black bg-red-500 text-white flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"><HeartPulse size={32}/><span className="font-black uppercase text-[10px]">{t.medicalInfo}</span></button>
                    <button onClick={handleWhereAmI} className="h-28 rounded-2xl border-[4px] border-black bg-purple-400 text-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"><MapPin size={32}/><span className="font-black uppercase text-[10px]">{t.whereAmI}</span></button>
                  </div>
                  {locationText && <div className="mt-4 p-4 bg-yellow-100 border-4 border-black font-black text-[12px] uppercase text-black leading-tight shadow-md">{locationText}</div>}
                </section>
                <div className="h-10 shrink-0" />
              </div>

              <div className="p-6 bg-white border-t-[6px] border-black shrink-0 relative z-30 box-border">
                <button onClick={() => setShowAccessModal(false)} className="w-full h-16 sm:h-20 bg-red-500 text-white rounded-[24px] border-[4px] border-black font-black uppercase text-xl sm:text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all box-border">{t.close}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add App Modal - Padronizado */}
      <AnimatePresence>
        {showAddAppModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[3000] flex items-center justify-center">
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full h-full flex flex-col overflow-hidden bg-white text-black"
            >
              <div className="p-6 bg-blue-500 border-b-[6px] border-black text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-2xl border-[4px] border-white/40">
                    <Plus size={28} strokeWidth={4} />
                  </div>
                  <h2 className="font-black text-xl sm:text-2xl uppercase italic tracking-tighter">{t.addAppTitle}</h2>
                </div>
                <button onClick={() => setShowAddAppModal(false)} className="p-2 bg-white text-black rounded-xl border-[4px] border-black active:translate-y-1 transition-all">
                  <X size={28} strokeWidth={4} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 bg-gray-50">
                {Object.entries(PRESET_APPS).filter(([id]) => !visibleAppIds.includes(id)).map(([id, app]) => (
                  <button 
                    key={id} 
                    id={`add-${id}`}
                    onClick={() => addApp(id)} 
                    className={cn(
                      "p-4 rounded-[32px] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-2 active:translate-y-1 active:shadow-none transition-all",
                      app.color
                    )}
                  >
                    <div className="scale-110 text-black">{app.icon}</div>
                    <span className="font-black text-sm uppercase tracking-tighter text-black">{app.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="p-6 bg-white border-t-[6px] border-black">
                <button 
                  onClick={() => setShowAddAppModal(false)} 
                  className="w-full h-16 bg-red-500 text-white border-[4px] border-black rounded-[24px] font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical Info Sub-Modal - Padronizado */}
      <AnimatePresence>
        {showMedicalInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[4000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, y: 50 }} 
              animate={{ scale: 1, y: 0 }} 
              className="w-full max-w-lg h-[80vh] rounded-[48px] border-[6px] border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden bg-red-600 text-white"
            >
              <div className="p-6 bg-red-700 border-b-[6px] border-black flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-2xl border-[4px] border-white/40">
                    <Heart size={28} strokeWidth={4} />
                  </div>
                  <h2 className="font-black text-xl sm:text-2xl uppercase italic tracking-tighter">{t.medicalInfo}</h2>
                </div>
                <button onClick={() => setShowMedicalInfo(false)} className="bg-white text-black p-2 rounded-xl border-[4px] border-black"><X size={28}/></button>
              </div>
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="bg-black/20 p-5 rounded-[24px] border-2 border-white/30">
                  <span className="font-black text-xs uppercase opacity-60 tracking-wider font-sans">{t.medicalName}</span>
                  <p className="font-black text-2xl sm:text-3xl mt-1">JOÃO DA SILVA</p>
                </div>
                <div className="bg-black/20 p-5 rounded-[24px] border-2 border-white/30">
                  <span className="font-black text-xs uppercase opacity-60 tracking-wider font-sans">{t.medicalBlood}</span>
                  <p className="font-black text-5xl mt-1">O +</p>
                </div>
                <div className="bg-black/20 p-5 rounded-[24px] border-2 border-white/30">
                  <span className="font-black text-xs uppercase opacity-60 tracking-wider font-sans">{t.medicalAllergies}</span>
                  <p className="font-black text-xl mt-1 uppercase">PENICILINA, LÁTEX</p>
                </div>
                <div className="p-6 bg-white text-black rounded-[24px] border-[4px] border-black font-black text-xl text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  {t.medicalPhone}: (11) 99999-9999
                </div>
              </div>
              <div className="p-6 bg-red-700 border-t-[6px] border-black">
                <button onClick={() => setShowMedicalInfo(false)} className="w-full h-16 bg-white text-black rounded-[24px] border-[4px] border-black font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">{t.close}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-md z-[2000] flex items-center justify-center">
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "w-full h-full flex flex-col transition-colors overflow-hidden",
                themeMode === 'custom' ? "" : (themeMode === 'default' ? "bg-white border-black text-black" : (THEMES[themeMode]?.bg + " " + THEMES[themeMode]?.cardBorder + " " + THEMES[themeMode]?.text))
              )}
              style={themeMode === 'custom' ? { backgroundColor: customTheme.bg, color: customTheme.fg } : {}}
            >
              <div className={cn("p-6 sm:p-8 flex-shrink-0 border-b-[6px] border-black flex items-center justify-between", themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-blue-500 text-white" : "bg-transparent border-current"))}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center bg-black/10 rounded-[20px] border-[4px] border-black/20">
                    <Settings size={32} strokeWidth={3} />
                  </div>
                  <h2 className="font-black text-2xl sm:text-3xl uppercase italic tracking-tighter leading-none">Configurações</h2>
                </div>
                <button onClick={() => setShowSettingsModal(false)} className={cn("p-3 rounded-2xl border-[4px] border-black active:translate-y-1 flex-shrink-0", themeMode === 'custom' ? "bg-transparent" : "bg-white text-black")}><X size={32} strokeWidth={3} /></button>
              </div>
              
              <div className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-8 pb-36 custom-scrollbar">
                {/* IDIOMA */}
                <section>
                  <h3 className="font-black text-xs uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2 text-current px-2"><Smartphone size={16}/> Idioma / Language</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {(['pt-BR', 'en-US', 'es-ES'] as Language[]).map((lang) => (
                      <button 
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={cn(
                          "min-h-[80px] p-4 rounded-2xl border-[4px] border-black flex items-center justify-between font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all",
                          language === lang ? "bg-yellow-400 text-black shadow-none translate-y-1" : "bg-white text-black"
                        )}
                      >
                        <span className="text-xl">
                          {lang === 'pt-BR' ? '🇧🇷 Português' : lang === 'en-US' ? '🇺🇸 English' : '🇪🇸 Español'}
                        </span>
                        {language === lang && <CheckCircle size={32} className="text-green-600" />}
                      </button>
                    ))}
                  </div>
                </section>
                
                <div className="pt-8 pb-4 text-center">
                  <p className="font-black text-xs opacity-30 uppercase tracking-widest">Acesso Livre v{VERSION}</p>
                </div>
              </div>

              <div className="p-6 bg-white border-t-[6px] border-black shrink-0 relative z-30 box-border">
                <button onClick={() => setShowSettingsModal(false)} className="w-full h-16 sm:h-20 bg-blue-500 text-white rounded-[24px] border-[4px] border-black font-black uppercase text-xl sm:text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all box-border">{t.close}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
