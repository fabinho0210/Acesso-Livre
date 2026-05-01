import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
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

export default function App() {
  // --- Accessibility States ---
  const [fontSize, setFontSize] = useState<number>(() => parseInt(localStorage.getItem('launcher_fontSize') || '22'));
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('launcher_darkMode') === 'true');
  const [highContrastMode, setHighContrastMode] = useState(() => localStorage.getItem('launcher_highContrast') === 'true');
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('launcher_reduceMotion') === 'true');
  const [colorblindMode, setColorblindMode] = useState(() => localStorage.getItem('launcher_colorblindMode') === 'true');
  const [lockEdit, setLockEdit] = useState(() => localStorage.getItem('launcher_lockEdit') === 'true');
  const [vibrateOnTouch, setVibrateOnTouch] = useState(() => localStorage.getItem('launcher_vibrateOnTouch') !== 'false');
  const [readingLine, setReadingLine] = useState(false);
  const [flashAlert, setFlashAlert] = useState(false);
  const [confirmCall, setConfirmCall] = useState(() => localStorage.getItem('launcher_confirmCall') === 'true');
  const [trackpadEnabled, setTrackpadEnabled] = useState(() => localStorage.getItem('launcher_trackpadEnabled') !== 'false');
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('launcher_voiceEnabled') !== 'false');
  const [enhancedFeedback, setEnhancedFeedback] = useState(() => localStorage.getItem('launcher_enhancedFeedback') !== 'false');
  
  // --- Theme States ---
  type Language = 'pt-BR' | 'en-US' | 'es-ES';
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('launcher_language') as Language) || 'pt-BR');

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
      configUnlocked: "Configurações Liberadas"
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
      assistantOn: "Listening now..."
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
      assistantOn: "Escuchando..."
    }
  };

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

  // --- Theme States ---
  type ThemePreset = 'default' | 'classic' | 'inverted' | 'night' | 'solar' | 'custom';
  const [themeMode, setThemeMode] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem('launcher_themeMode');
    const validThemes: ThemePreset[] = ['default', 'classic', 'inverted', 'night', 'solar', 'custom'];
    return (validThemes.includes(saved as ThemePreset) ? saved : 'default') as ThemePreset;
  });
  const [customTheme, setCustomTheme] = useState(() => {
    const saved = localStorage.getItem('launcher_customTheme');
    return saved ? JSON.parse(saved) : { bg: '#e5e7eb', fg: '#000000', accent: '#facc15' };
  });

  // --- Theme Configuration ---
  const THEMES: Record<ThemePreset, { bg: string, text: string, cardBorder: string, shadow: string, name: string }> = {
    default: { bg: 'bg-[#e5e7eb]', text: 'text-black', cardBorder: 'border-black', shadow: 'rgba(0,0,0,1)', name: 'Padrão' },
    classic: { bg: 'bg-black', text: 'text-[#facc15]', cardBorder: 'border-[#facc15]', shadow: '#facc15', name: 'Clássico' },
    inverted: { bg: 'bg-white', text: 'text-black', cardBorder: 'border-black', shadow: 'rgba(0,0,0,1)', name: 'Invertido' },
    night: { bg: 'bg-[#0f172a]', text: 'text-[#38bdf8]', cardBorder: 'border-[#38bdf8]', shadow: '#38bdf8', name: 'Noturno' },
    solar: { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', cardBorder: 'border-[#92400e]', shadow: '#92400e', name: 'Solar' },
    custom: { bg: '', text: '', cardBorder: '', shadow: '', name: 'Customizado' }
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
  const [showAppList, setShowAppList] = useState(false);
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [locationText, setLocationText] = useState("");

  // --- Core States ---
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [dwellEnabled, setDwellEnabled] = useState(true);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [flashlightOn, setFlashlightOn] = useState(false);

  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dwellProgressRef = useRef(0);

  // --- Animation Springs ---
  const cursorX = useSpring(useMotionValue(50), { stiffness: reduceMotion ? 1500 : 450, damping: reduceMotion ? 120 : 35 });
  const cursorY = useSpring(useMotionValue(50), { stiffness: reduceMotion ? 1500 : 450, damping: reduceMotion ? 120 : 35 });

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
  const PRESET_APPS: Record<string, { label: string, color: string, icon: React.ReactNode, type: 'intent' | 'link', value: string }> = {
    'phone': { label: t.phone, color: 'bg-[#22c55e]', icon: <Phone size={52} strokeWidth={3} />, type: 'intent', value: 'tel:' },
    'whatsapp': { label: t.whatsapp, color: 'bg-[#059669]', icon: <MessageSquare size={52} strokeWidth={3} />, type: 'intent', value: 'intent://send#Intent;package=com.whatsapp;scheme=whatsapp;end' },
    'camera': { label: t.camera, color: 'bg-zinc-400', icon: <Eye size={52} strokeWidth={3} />, type: 'intent', value: 'intent:#Intent;action=android.media.action.STILL_IMAGE_CAMERA;end' },
    'browser': { label: t.browser, color: 'bg-blue-500', icon: <Search size={52} strokeWidth={3} />, type: 'intent', value: 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_BROWSER;end' },
    'emergency': { label: t.emergency, color: 'bg-[#ef4444]', icon: <AlertCircle size={52} strokeWidth={3} />, type: 'intent', value: 'tel:192' },
    'family': { label: t.family, color: 'bg-[#a855f7]', icon: <Home size={52} strokeWidth={3} />, type: 'link', value: '#' },
    'youtube': { label: t.youtube, color: 'bg-red-500', icon: <Youtube size={52} strokeWidth={3} />, type: 'intent', value: 'com.google.android.youtube' },
    'facebook': { label: t.facebook, color: 'bg-blue-600', icon: <Facebook size={52} strokeWidth={3} />, type: 'intent', value: 'com.facebook.katana' },
    'instagram': { label: t.instagram, color: 'bg-pink-500', icon: <Eye size={52} strokeWidth={3} />, type: 'intent', value: 'com.instagram.android' },
    'calc': { label: t.calc, color: 'bg-zinc-600', icon: <Calculator size={52} strokeWidth={3} />, type: 'intent', value: 'com.android.calculator2' },
    'gallery': { label: t.gallery, color: 'bg-yellow-400', icon: <LayoutGrid size={52} strokeWidth={3} />, type: 'intent', value: 'intent:android.intent.action.VIEW;type=image/*;end' },
    'email': { label: t.email, color: 'bg-white', icon: <Mail size={52} strokeWidth={3} />, type: 'intent', value: 'com.google.android.gm' },
    'maps': { label: t.maps, color: 'bg-green-500', icon: <MapPin size={52} strokeWidth={3} />, type: 'intent', value: 'com.google.android.apps.maps' },
  };

  const [visibleAppIds, setVisibleAppIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('launcher_visibleApps');
    return saved ? JSON.parse(saved) : ['phone', 'whatsapp', 'camera', 'browser', 'emergency', 'family'];
  });

  const addApp = (id: string) => {
    if (!visibleAppIds.includes(id)) {
      const newIds = [...visibleAppIds, id];
      setVisibleAppIds(newIds);
      localStorage.setItem('launcher_visibleApps', JSON.stringify(newIds));
      triggerHaptic([50]);
      speak(`${t.added} ${PRESET_APPS[id].label}`);
    }
    setShowAddAppModal(false);
  };

  const removeApp = (id: string) => {
    const newIds = visibleAppIds.filter(appId => appId !== id);
    setVisibleAppIds(newIds);
    localStorage.setItem('launcher_visibleApps', JSON.stringify(newIds));
    triggerHaptic([100]);
    speak(t.removed);
  };

  const handleAppAction = (id: string) => {
    const app = PRESET_APPS[id];
    if (!app) return;

    triggerHaptic([50]);
    speak(`${t.opened} ${app.label}`);

    if (app.type === 'link') {
      window.location.href = app.value;
    } else {
      if (app.value.startsWith('tel:')) {
        if (confirmCall) speak(t.confirmCallMsg);
        window.location.href = app.value;
      } else {
        window.location.href = `intent://#Intent;package=${app.value};scheme=https;end`;
      }
    }
  };

  const allApps: AppData[] = [
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
  ];

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
      const newState = !flashlightOn;
      setFlashlightOn(newState);
      speak(newState ? t.flashlightOn : t.flashlightOff);
    }
    else if (cmd.includes('horas') || cmd.includes('time') || cmd.includes('reloj')) {
      const timeStr = currentTime.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });
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

    const xPx = (cursorPos.x / 100) * window.innerWidth;
    const headerHeight = 80;
    const navHeight = 96;
    const controlsHeight = window.innerHeight * 0.32;
    const mainAreaHeight = window.innerHeight - headerHeight - navHeight - controlsHeight;
    
    // Convert relative Y to viewport Y within the main area scrollable container
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
    setCursorPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
      if (vibrateOnTouch) triggerHaptic([5]);
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
        "fixed inset-0 flex flex-col overflow-hidden select-none transition-all duration-500 font-sans",
        themeMode !== 'custom' && (THEMES[themeMode]?.bg || THEMES.default.bg),
        themeMode !== 'custom' && (THEMES[themeMode]?.text || THEMES.default.text),
        colorblindMode && "grayscale contrast-125"
      )}
      style={{ 
        fontSize: `${fontSize}px`,
        ...(themeMode === 'custom' ? currentThemeStyles.background : {})
      }}
    >
      {/* Flash Overlay */}
      <AnimatePresence>
        {(flashAlert || flashlightOn) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: flashlightOn ? 0.4 : 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-yellow-400/80 z-[3000] pointer-events-none" />
        )}
      </AnimatePresence>

      {/* Reading Line Overlay */}
      {readingLine && (
        <motion.div 
          animate={{ top: `calc(120px + ${cursorY.get()}% * (100vh - 120px - 96px - 32vh))` }}
          className={cn(
            "fixed left-0 right-0 h-10 border-y-4 z-[50] pointer-events-none transition-all duration-75",
            themeMode === 'custom' ? "" : (themeMode === 'default' ? "bg-yellow-400/40 border-black" : "bg-white/20")
          )}
          style={themeMode === 'custom' ? { backgroundColor: `${customTheme.fg}40`, borderColor: customTheme.fg } : (themeMode !== 'default' ? { borderColor: 'currentColor' } : {})}
        />
      )}

      {/* Header */}
      <header className={cn(
        "h-[120px] flex-shrink-0 border-b-[4px] relative px-6 z-[200] flex flex-col justify-center items-center shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)]",
        themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-white" : (THEMES[themeMode]?.bg || THEMES.default.bg)),
        themeMode !== 'custom' ? (THEMES[themeMode]?.cardBorder || THEMES.default.cardBorder) : ""
      )} style={themeMode === 'custom' ? {borderColor: customTheme.fg} : {}}>
        
        {/* Lado Esquerdo: Acessibilidade e Idiomas */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <button 
            id="access-btn"
            onClick={() => { setShowAccessModal(true); triggerHaptic([50]); speak(t.accOpened); }}
            className={cn(
              "w-14 h-14 flex-shrink-0 rounded-2xl border-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-x-1 active:translate-y-1 active:shadow-none transition-all",
              themeMode === 'custom' ? "bg-white border-black" : (themeMode === 'default' ? "bg-yellow-400 border-black" : "bg-transparent")
            )}
            style={themeMode === 'custom' ? {borderColor: customTheme.fg, boxShadow: `4px 4px 0px 0px ${customTheme.fg}`, color: customTheme.fg} : {}}
          >
            <Accessibility size={32} strokeWidth={3} />
          </button>
          
          <div className="hidden sm:flex flex-col gap-1 items-center bg-black/5 p-1 rounded-xl border-2 border-black/10">
            <button id="lang-pt" onClick={() => changeLanguage('pt-BR')} className={cn("text-lg hover:scale-110", language === 'pt-BR' && "scale-125")} title="Português">🇧🇷</button>
            <button id="lang-en" onClick={() => changeLanguage('en-US')} className={cn("text-lg hover:scale-110", language === 'en-US' && "scale-125")} title="English">🇺🇸</button>
            <button id="lang-es" onClick={() => changeLanguage('es-ES')} className={cn("text-lg hover:scale-110", language === 'es-ES' && "scale-125")} title="Español">🇪🇸</button>
          </div>
        </div>

        {/* Centro: RELÓGIO E DATA (Destaque Principal) */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className={cn("font-black text-5xl sm:text-7xl tracking-tighter leading-none mb-1")} style={themeMode === 'custom' ? {color: customTheme.fg} : {color: 'inherit'}}>
            {currentTime.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className={cn("font-black text-[12px] sm:text-sm uppercase tracking-widest opacity-80")} style={themeMode === 'custom' ? {color: customTheme.fg} : {color: 'inherit'}}>
            {currentTime.toLocaleDateString(language, { weekday: 'long', day: '2-digit', month: 'long' })}
          </span>
        </div>

        {/* Lado Direito: Settings e Identidade */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end opacity-40">
            <h1 className="font-black italic text-sm tracking-tighter uppercase leading-none" style={themeMode === 'custom' ? {color: customTheme.fg} : {}}>{t.appName}</h1>
          </div>
          <button 
            id="settings-btn"
            onClick={() => triggerHaptic([50])}
            className={cn(
              "w-14 h-14 rounded-2xl border-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-x-1 transition-all",
              themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-white" : (THEMES[themeMode]?.bg || THEMES.default.bg))
            )}
            style={themeMode === 'custom' ? {borderColor: customTheme.fg, boxShadow: `4px 4px 0px 0px ${customTheme.fg}`} : {}}
          >
            <Settings size={32} strokeWidth={2.5} style={themeMode === 'custom' ? {color: customTheme.fg} : {}} />
          </button>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL DINÂMICA (Scrollable Grid) */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto z-10 custom-scrollbar scroll-smooth">
        <motion.div 
          animate={{ scale: zoomScale, x: panPos.x, y: panPos.y }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-xl mx-auto"
        >
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full pb-12">
          {allApps.map(app => (
            <motion.div
              key={app.id}
              id={app.id}
              onClick={app.action}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') app.action(); }}
              whileHover={enhancedFeedback ? { scale: 1.05, y: -4 } : {}}
              whileTap={enhancedFeedback ? { scale: 0.95, y: 4, x: 4 } : {}}
              className={cn(
                "relative flex flex-col aspect-square items-center justify-center gap-2 rounded-[32px] sm:rounded-[48px] border-[4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer select-none",
                themeMode === 'classic' || themeMode === 'night' ? "bg-black" : (themeMode === 'custom' ? "" : app.color),
                themeMode !== 'custom' ? (THEMES[themeMode]?.cardBorder || THEMES.default.cardBorder) : "",
                themeMode !== 'custom' ? (THEMES[themeMode]?.text || THEMES.default.text) : "",
                hoveredId === app.id && enhancedFeedback ? "shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]" : "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              )}
              style={{
                boxShadow: hoveredId === app.id && enhancedFeedback 
                  ? `16px 16px 0px 0px ${themeMode === 'custom' ? customTheme.fg : currentThemeStyles.shadowColor}`
                  : `8px 8px 0px 0px ${themeMode === 'custom' ? customTheme.fg : currentThemeStyles.shadowColor}`,
                ...(themeMode === 'custom' ? { 
                  backgroundColor: customTheme.accent, 
                  borderColor: customTheme.fg,
                  color: customTheme.fg
                } : {})
              }}
            >
              <div style={themeMode === 'custom' ? { color: customTheme.fg } : { color: 'inherit' }}>{app.icon}</div>
              <span className="font-black text-sm sm:text-lg uppercase px-2 text-center" style={themeMode === 'custom' ? { color: customTheme.fg } : { color: 'inherit' }}>{app.label}</span>
              {!lockEdit && app.id !== 'app-all' && (
                <button 
                  id={`del-${app.id}`}
                  onClick={(e) => { e.stopPropagation(); removeApp(app.id); }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-red-500 rounded-full border-[4px] border-black flex items-center justify-center shadow-lg active:translate-y-1 transition-all z-20"
                >
                  <X size={24} strokeWidth={4} className="text-white" />
                </button>
              )}
            </motion.div>
          ))}
          
          {!lockEdit && (
            <button
              id="add-app-btn"
              onClick={() => setShowAddAppModal(true)}
              className={cn(
                "flex flex-col aspect-square items-center justify-center gap-2 rounded-[32px] sm:rounded-[48px] border-[4px] border-dashed shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all",
                isDarkMode || highContrastMode ? "border-white/40 text-white/40" : "border-black/40 text-black/40",
                hoveredId === 'add-app-btn' ? "scale-[1.05] border-solid" : "scale-100"
              )}
            >
              <Plus size={64} strokeWidth={3} />
              <span className="font-black text-sm uppercase">{t.add}</span>
            </button>
          )}
          </div>
        </motion.div>
      </main>

      {/* Nav Bar */}
      <nav className={cn(
        "h-24 flex-shrink-0 border-y-[4px] grid grid-cols-4 z-[100]",
        themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-white" : (THEMES[themeMode]?.bg || THEMES.default.bg)),
        themeMode !== 'custom' ? (THEMES[themeMode]?.cardBorder || THEMES.default.cardBorder) : "",
        themeMode !== 'custom' ? (THEMES[themeMode]?.text || THEMES.default.text) : ""
      )} style={themeMode === 'custom' ? {borderColor: customTheme.fg, color: customTheme.fg} : {}}>
        {[
          { id: 'nav-back', label: t.navBack, icon: <ArrowLeft size={32} /> },
          { id: 'nav-help', label: t.navHelp, icon: <Search size={32} /> },
          { id: 'nav-home', label: t.navHome, icon: <Home size={32} /> },
          { id: 'nav-menu', label: t.navMenu, icon: <Menu size={32} /> },
        ].map(item => (
          <button 
            key={item.id} 
            id={item.id} 
            className={cn(
              "flex flex-col items-center justify-center border-r-[2px] last:border-r-0 active:bg-gray-100 transition-colors uppercase",
              themeMode !== 'custom' ? (themeMode === 'default' ? "border-black/20" : (THEMES[themeMode]?.cardBorder || THEMES.default.cardBorder).replace('border-', 'border-opacity-20 border-')) : ""
            )}
            style={themeMode === 'custom' ? {borderColor: `${customTheme.fg}40`, color: customTheme.fg} : {}}
          >
            {item.icon}
            <span className="font-black text-[10px] sm:text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Assistive Controls Section (Trackpad / Powe Buttons) */}
      <div 
        className={cn("h-[32%] flex-shrink-0 grid grid-cols-[140px_1fr_140px] border-b-[4px] z-[100]", themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-[#e5e7eb]" : (THEMES[themeMode]?.bg || THEMES.default.bg)))}
        style={themeMode === 'custom' ? {borderColor: customTheme.fg} : {}}
      >
        <div 
          className={cn("border-r-[4px] flex items-center justify-center", themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-white" : (THEMES[themeMode]?.bg || THEMES.default.bg)))}
          style={themeMode === 'custom' ? {borderColor: customTheme.fg} : {}}
        >
          <button 
            id="mic-btn" 
            onClick={() => { setIsVoiceActive(!isVoiceActive); triggerHaptic([50]); speak(isVoiceActive ? t.assistantOff : t.assistantOn); }} 
            className={cn("w-20 h-20 rounded-full border-[4px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all relative overflow-hidden", isVoiceActive ? "bg-red-400 border-black text-white" : (themeMode === 'default' ? "bg-white border-black text-black" : "bg-transparent"))}
            style={{
              boxShadow: `4px 4px 0px 0px ${themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? 'rgba(0,0,0,1)' : (THEMES[themeMode]?.shadow || 'rgba(0,0,0,1)'))}`,
              borderColor: themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? 'black' : 'currentColor'),
              color: isVoiceActive ? 'white' : (themeMode === 'custom' ? customTheme.fg : undefined)
            }}
          >
            <AnimatePresence>
              {isVoiceActive && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-white/30 rounded-full"
                />
              )}
            </AnimatePresence>
            <motion.div
              animate={isVoiceActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className="z-10"
            >
              {isVoiceActive ? <Mic size={44} /> : <MicOff size={44} />}
            </motion.div>
          </button>
        </div>
        <div 
          id="tracks-area" 
          className={cn(
            "relative overflow-hidden flex flex-col items-center justify-center transition-all",
            !trackpadEnabled && "opacity-40 grayscale pointer-events-none",
            trackpadEnabled && (themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-white" : (THEMES[themeMode]?.bg || THEMES.default.bg)))
          )} 
          onMouseMove={trackpadEnabled ? handleTrackpadMove : undefined} 
          onTouchMove={trackpadEnabled ? handleTrackpadMove : undefined} 
          onClick={trackpadEnabled ? handleClick : undefined}
          style={themeMode === 'custom' ? {borderColor: customTheme.fg} : {}}
        >
          {/* Assistente Listening Indicator */}
          <AnimatePresence>
            {isVoiceActive && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute top-4 left-0 right-0 flex flex-col items-center gap-2 z-20 pointer-events-none"
              >
                <div className="flex items-center gap-1.5 px-4 py-2 bg-black/80 rounded-full border-2 border-white/20 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-black text-[10px] uppercase text-white tracking-widest">
                    {t.assistantOn} {!navigator.onLine ? ' (OFFLINE)' : ''}
                  </span>
                  <div className="flex items-end gap-0.5 h-3 ml-2">
                    {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                      <motion.div 
                        key={i}
                        animate={{ height: [`${h*20}%`, `${h*80}%`, `${h*20}%`] }}
                        transition={{ duration: 0.5 + i*0.1, repeat: Infinity, ease: "easeInOut" }}
                        className="w-0.5 bg-red-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {trackpadEnabled ? (
            <div className="flex flex-col items-center justify-center pointer-events-none opacity-10">
              {/* Layout Clean: Apenas um respiro visual */}
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-current" />
                <div className="w-2 h-2 rounded-full bg-current" />
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>
            </div>
          ) : (
            <span className={cn("font-black text-xl sm:text-2xl tracking-[0.3em] pointer-events-none uppercase text-center px-4 opacity-40")} style={themeMode === 'custom' ? {color: customTheme.fg} : {color: 'inherit'}}>
              {t.disabled}
            </span>
          )}
          
          {trackpadEnabled && dwellEnabled && dwellProgress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-32 h-32 rotate-[-90deg]">
                <circle cx="64" cy="64" r="60" fill="none" stroke={themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? "#fbbf24" : "currentColor")} strokeWidth="8" strokeDasharray="377" strokeDashoffset={377 - (377 * dwellProgress) / 100} className="transition-all duration-75" />
              </svg>
            </div>
          )}
        </div>
        <div className={cn("border-l-[4px] flex items-center justify-center", themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-white" : (THEMES[themeMode]?.bg || THEMES.default.bg)), themeMode !== 'custom' ? (THEMES[themeMode]?.cardBorder || THEMES.default.cardBorder) : "")} style={themeMode === 'custom' ? {borderColor: customTheme.fg} : {}}>
          <button 
            id="flashlight-btn" 
            onClick={() => { 
              const newState = !flashlightOn;
              setFlashlightOn(newState); 
              triggerHaptic([50, 100]); 
              speak(newState ? t.flashlightOn : t.flashlightOff);
            }} 
            className={cn(
              "w-20 h-20 rounded-full border-[4px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all",
              flashlightOn ? "bg-yellow-400 border-black text-black" : (themeMode === 'default' ? "bg-gray-100 border-black text-black" : "bg-transparent")
            )}
            style={{
              borderColor: themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? 'black' : 'currentColor'),
              boxShadow: `4px 4px 0px 0px ${themeMode === 'custom' ? customTheme.fg : (themeMode === 'default' ? 'rgba(0,0,0,1)' : (THEMES[themeMode]?.shadow || 'rgba(0,0,0,1)'))}`,
              color: (flashlightOn || themeMode === 'default') ? 'black' : (themeMode === 'custom' ? customTheme.fg : 'inherit')
            }}
          >
            <Flashlight size={44} />
          </button>
        </div>
      </div>

      {/* Visual Cursor */}
      <AnimatePresence>
        {trackpadEnabled && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: isClicking ? 0.7 : 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed pointer-events-none z-[1000]" 
            style={{ left: cursorX.get() + 'vw', top: `calc(${80}px + ${cursorY.get()}% * (100vh - 80px - 96px - 32vh))`, x: "-50%", y: "-50%" }}
          >
            <svg viewBox="0 0 100 100" className="w-[60px] h-[60px] sm:w-[120px] sm:h-[120px] drop-shadow-2xl transform rotate-[-45deg]">
              <path d="M10,10 L90,50 L50,55 L45,90 Z" fill={highContrastMode || isDarkMode ? "#fff" : "#facc15"} stroke="black" strokeWidth="10" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility Modal */}
      <AnimatePresence>
        {showAccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, y: 50 }} 
              animate={{ scale: 1, y: 0 }} 
              className={cn(
                "w-full max-w-2xl max-h-[92vh] rounded-[40px] border-[6px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden transition-colors",
                themeMode === 'custom' ? "" : (themeMode === 'default' ? "bg-white border-black text-black" : (THEMES[themeMode]?.bg + " " + THEMES[themeMode]?.cardBorder + " " + THEMES[themeMode]?.text))
              )}
              style={themeMode === 'custom' ? { backgroundColor: customTheme.bg, borderColor: customTheme.fg, color: customTheme.fg, boxShadow: `20px 20px 0px 0px ${customTheme.fg}` } : (themeMode !== 'default' ? { boxShadow: `20px 20px 0px 0px ${THEMES[themeMode]?.shadow}` } : {})}
            >
              <div className={cn("p-6 border-b-[6px] flex items-center justify-between", themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-yellow-400 border-black text-black" : "bg-transparent border-current"))}>
                <div className="flex items-center gap-3">
                  <Accessibility size={40} />
                  <h2 className="font-black text-xl sm:text-2xl uppercase italic">{t.accessibility}</h2>
                </div>
                <button onClick={() => setShowAccessModal(false)} className={cn("p-3 rounded-2xl border-[4px] active:translate-y-1", themeMode === 'custom' ? "bg-transparent border-current" : "bg-white border-black text-black")}><X size={32} /></button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-8 pb-32">
                {/* VISÃO */}
                <section>
                  <h3 className="font-black text-xs uppercase tracking-widest mb-4 opacity-70 flex items-center gap-2"><Eye size={16}/> {t.vision}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setFontSize(s => Math.min(48, s + 4))} className={cn("h-28 rounded-2xl border-[4px] border-black bg-blue-400 flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]")}><ZoomIn size={32} className="text-black" /><span className="font-black uppercase text-[10px] text-black">{t.increaseText}</span></button>
                    <button onClick={() => { setZoomScale(2); setShowAccessModal(false); speak(t.lupaOn); }} className="h-28 rounded-2xl border-[4px] border-black bg-cyan-400 flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"><Search size={32} className="text-black" /><span className="font-black uppercase text-[10px] text-black">{t.magnifier}</span></button>
                    <button onClick={() => setReadingLine(!readingLine)} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", readingLine ? "bg-yellow-400 text-black shadow-none" : "bg-zinc-100 text-black")}><Type size={32} /><span className="font-black uppercase text-[10px]">{t.readingLine}</span></button>
                    
                    <section className="col-span-3 mt-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 px-2 text-black"><Palette size={24} /> {t.themes}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {(Object.entries(THEMES) as [ThemePreset, any][]).filter(([k]) => k !== 'custom').map(([key, item]) => (
                          <button 
                            key={key} 
                            onClick={() => {
                              setThemeMode(key);
                              localStorage.setItem('launcher_themeMode', key);
                              triggerHaptic([50]);
                              speak(`${t.themeActivated}: ${THEME_NAMES[language][key]}`);
                            }}
                            className={cn(
                              "h-24 rounded-xl border-[3px] flex items-center justify-center font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                              themeMode === key ? "border-blue-500 scale-95 shadow-none" : "border-black bg-white"
                            )}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <div className={cn("w-12 h-6 rounded border-2 border-black", item.bg)} />
                              {THEME_NAMES[language][key]}
                            </div>
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => { setThemeMode('custom'); localStorage.setItem('launcher_themeMode', 'custom'); speak(t.customThemeOn); }}
                        className={cn("w-full mt-4 h-16 rounded-2xl border-4 border-black font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", themeMode === 'custom' ? "bg-purple-400" : "bg-white")}
                      >
                        🎨 {language === 'en-US' ? 'Create My Theme' : (language === 'es-ES' ? 'Crear Mi Tema' : 'Criar Meu Tema')}
                      </button>
                    </section>

                    {themeMode === 'custom' && (
                      <section className="col-span-3 mt-6 bg-zinc-100 p-4 rounded-3xl border-4 border-black">
                        <h3 className="font-bold text-lg mb-4 text-black italic">{t.customCores}</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-black uppercase text-black">{language === 'en-US' ? 'Background' : (language === 'es-ES' ? 'Fondo' : 'Fundo')}</span>
                            <div className="flex gap-2 flex-wrap">
                              {['#ffffff', '#000000', '#111827', '#fef3c7', '#064e3b', '#450a0a'].map(c => (
                                <button key={c} onClick={() => setCustomTheme({...customTheme, bg: c})} className="w-8 h-8 rounded-full border-2 border-black" style={{backgroundColor: c}} />
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-xs font-black uppercase text-black">{language === 'en-US' ? 'Elements' : (language === 'es-ES' ? 'Elementos' : 'Elementos')}</span>
                            <div className="flex gap-2 flex-wrap">
                              {['#000000', '#ffffff', '#facc15', '#38bdf8', '#ef4444', '#fbbf24'].map(c => (
                                <button key={c} onClick={() => setCustomTheme({...customTheme, fg: c, accent: c})} className="w-8 h-8 rounded-full border-2 border-black" style={{backgroundColor: c}} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => { localStorage.setItem('launcher_customTheme', JSON.stringify(customTheme)); speak(t.colorsSaved); }}
                          className="w-full mt-4 h-12 bg-green-400 rounded-xl border-4 border-black font-black uppercase text-black"
                        >
                          {t.save}
                        </button>
                      </section>
                    )}
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
                    }} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", trackpadEnabled ? "bg-yellow-400 text-black shadow-none" : "bg-gray-100 text-black")}>
                      <Maximize2 size={32} />
                      <span className="font-black uppercase text-[10px]">{trackpadEnabled ? `${t.trackpad} On` : `${t.trackpad} Off`}</span>
                    </button>
                    <button onClick={() => {
                      const newState = !lockEdit;
                      setLockEdit(newState);
                      localStorage.setItem('launcher_lockEdit', String(newState));
                      triggerHaptic([50]);
                      speak(newState ? t.lockOn : t.lockOff);
                    }} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", lockEdit ? "bg-red-400 text-white shadow-none" : "bg-zinc-100 text-black")}>
                      {lockEdit ? <Lock size={32} /> : <Unlock size={32} />}
                      <span className="font-black uppercase text-[10px]">{lockEdit ? `${t.setup} OFF` : `${t.setup} ON`}</span>
                    </button>
                    <button onClick={() => setConfirmCall(!confirmCall)} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", confirmCall ? "bg-green-400 text-black shadow-none" : "bg-gray-100 text-black")}><CheckCircle size={32} /><span className="font-black uppercase text-[10px]">{t.confirmCall}</span></button>
                    <button onClick={() => {
                      const newState = !dwellEnabled;
                      setDwellEnabled(newState);
                      localStorage.setItem('launcher_dwellEnabled', String(newState));
                      triggerHaptic([50]);
                      speak(newState ? t.dwellOn : t.dwellOff);
                    }} className={cn("h-28 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", dwellEnabled ? "bg-cyan-400 text-black shadow-none" : "bg-gray-100 text-black")}>
                      <Zap size={32} />
                      <span className="font-black uppercase text-[10px]">{dwellEnabled ? `${t.dwell} On` : `${t.dwell} Off`}</span>
                    </button>
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
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t-[6px] border-black z-30">
                <button onClick={() => setShowAccessModal(false)} className="w-full h-20 bg-[#ef4444] text-white rounded-[24px] border-[4px] border-black font-black uppercase text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">{t.close}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add App Modal */}
      <AnimatePresence>
        {showAddAppModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[3000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              className={cn(
                "w-full max-w-lg rounded-[40px] border-[6px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden",
                themeMode === 'custom' ? "" : (themeMode === 'default' ? "bg-white border-black text-black" : (THEMES[themeMode]?.bg + " " + THEMES[themeMode]?.cardBorder + " " + THEMES[themeMode]?.text))
              )}
              style={themeMode === 'custom' ? { backgroundColor: customTheme.bg, borderColor: customTheme.fg, color: customTheme.fg, boxShadow: `20px 20px 0px 0px ${customTheme.fg}` } : (themeMode !== 'default' ? { boxShadow: `20px 20px 0px 0px ${THEMES[themeMode]?.shadow}` } : {})}
            >
              <div className={cn("p-6 border-b-[6px] flex items-center justify-between", themeMode === 'custom' ? "bg-transparent border-current" : (themeMode === 'default' ? "bg-blue-400 border-black text-black" : "bg-transparent border-current"))}>
                <h2 className="font-black text-2xl uppercase italic">{t.addAppTitle}</h2>
                <button onClick={() => setShowAddAppModal(false)} className={cn("p-2 rounded-xl border-4 active:translate-y-1", themeMode === 'custom' ? "bg-transparent border-current" : "bg-white border-black text-black")}><X size={24}/></button>
              </div>
              <div className={cn("p-6 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto", themeMode === 'custom' ? "bg-transparent" : (themeMode === 'default' ? "bg-gray-50" : "bg-black/10"))}>
                {Object.entries(PRESET_APPS).filter(([id]) => !visibleAppIds.includes(id)).map(([id, app]) => (
                  <button 
                    key={id} 
                    id={`add-${id}`}
                    onClick={() => addApp(id)} 
                    className={cn(
                      "p-4 rounded-3xl border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-2 active:translate-y-1 active:shadow-none transition-all",
                      themeMode === 'default' ? app.color : "bg-transparent border-current"
                    )}
                    style={themeMode === 'custom' ? {borderColor: customTheme.fg, boxShadow: `4px 4px 0px 0px ${customTheme.fg}`} : (themeMode !== 'default' ? {boxShadow: `4px 4px 0px 0px currentColor`} : {})}
                  >
                    <div className="scale-90" style={{ color: 'inherit' }}>{app.icon}</div>
                    <span className="font-black text-[10px] uppercase" style={{ color: 'inherit' }}>{app.label}</span>
                  </button>
                ))}
              </div>
              <div className={cn("p-6 border-t-4", themeMode === 'custom' ? "bg-transparent border-current" : "bg-white border-black")}>
                <button 
                  onClick={() => setShowAddAppModal(false)} 
                  className={cn(
                    "w-full h-16 rounded-2xl border-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all",
                    themeMode === 'custom' ? "bg-transparent border-current" : "bg-red-500 border-black text-white"
                  )}
                  style={themeMode === 'custom' ? {boxShadow: `4px 4px 0px 0px ${customTheme.fg}`} : {}}
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medical Info Sub-Modal */}
      <AnimatePresence>
        {showMedicalInfo && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="fixed inset-0 bg-red-600 z-[3000] p-8 flex flex-col text-white overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="font-black text-4xl uppercase italic tracking-tighter">{t.medicalInfo}</h2>
                <button onClick={() => setShowMedicalInfo(false)} className="bg-white text-black p-4 rounded-3xl border-8 border-black"><X size={40}/></button>
            </div>
            <div className="space-y-8 flex-1">
                <div className="bg-black/20 p-6 rounded-[32px] border-2 border-white/30">
                    <span className="font-black text-xl uppercase opacity-60">{t.medicalName}</span>
                    <p className="font-black text-3xl sm:text-5xl">JOÃO DA SILVA</p>
                </div>
                <div className="bg-black/20 p-6 rounded-[32px] border-2 border-white/30">
                    <span className="font-black text-xl uppercase opacity-60">{t.medicalBlood}</span>
                    <p className="font-black text-7xl">O +</p>
                </div>
                <div className="bg-black/20 p-6 rounded-[32px] border-2 border-white/30">
                    <span className="font-black text-xl uppercase opacity-60">{t.medicalAllergies}</span>
                    <p className="font-black text-3xl">PENICILINA, LÁTEX</p>
                </div>
                <div className="p-8 bg-white text-black rounded-[32px] border-8 border-black font-black text-2xl text-center">{t.medicalPhone}: (11) 99999-9999</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
