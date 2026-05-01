# Acesso Livre - Accessibility Launcher System Instructions

This document outlines the core principles, design system, and functional logic for the "Acesso Livre" Accessibility Launcher. Use these instructions to maintain consistency across different versions or platforms.

## 1. Core Mission
The launcher is designed for users with severe motor impairments (Disarthria, Cerebral Palsy, Reduced Mobility) and visual/hearing needs. It bridges the gap between the user and the smartphone through a virtual mouse (trackpad), voice synthesis, and dwell-clicking.

## 2. Accessibility Guidelines (WCAG + Custom)
- **High Contrast Mode:** Expanded to Multiple Presets (Classic, Inverted, Night, Solar) via `themeMode`. All elements use 4px black or theme-colored borders.
- **Support Features:**
  - **Colorblind Mode:** Grayscale and enhanced contrast toggle.
  - **Reduce Motion:** Increases spring stiffness/damping for instant UI response.
- **Multilingual Support:** Full interface and voice synthesis support for Portuguese (pt-BR), English (en-US), and Spanish (es-ES).
- **Custom Personalization:** User can override background, element, and accent colors via `customTheme`.
- **Font Scale:** Support for dynamic font sizing (default 22px, ranges up to 48px).
- **Touch Targets:** Minimum 44x44px. Buttons are large (square grid layout, aspect-square).
- **Dwell Clicking:** Automatic activation when a cursor hovers over an element for 1.5s. Resets on movement to new target.
- **Visual Feedback:** 
  - Hover states: Scale up (1.05x), enhanced shadows, and high-frequency haptic (5ms).
  - Active states: Translation (1-4px down/right) to simulate physical button press ( Neo-Brutalism).
- **Reading Line:** A horizontal guide that flows beneath the cursor to assist in tracking text line-by-line.

## 3. Design System (Neo-Brutalism)
- **Style:** Thick black borders (4px), solid black shadows (`shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`), and vibrant solid colors.
- **Theme Colors:** 
  - Primary: `#facc15` (Yellow)
  - Secondary: Green (WhatsApp/Success), Blue (System), Red (Emergency/Stop).
  - Neutrals: Zinc-100/900 for utility buttons.
- **Architecture:**
  - Header (130px): Large Digital Clock and Date (Center), Accessibility trigger (Left), Settings (Right). Uses flexbox `justify-between` for responsive alignment.
  - Main Grid: Scrollable area for dynamic app cards. Layout uses `flex-grow: 1` to fill remaining space.
  - Nav Bar (Bottom Area): Grid layout containing Microphone (Left), Clean Trackpad Area (Center), and Flashlight (Right).
  - Trackpad Area (32dvh): Proportional control area for the virtual cursor. Displays a minimalist indicator when trackpad is enabled.

## 4. Functional Logic (Critical)

### Assistive Cursor & Trackpad
- **Resolution Independence:** Cursor position is stored as percentages (0-100% for X/Y).
- **Mapping:** `document.elementFromPoint(xPx, yPx)` translates percentages to screen coordinates, adjusted for the scrollable main area.
- **Toggle:** Trackpad can be disabled in Settings to allow standard touch interaction.
- **Visual Info:** The trackpad area is kept clean to focus on movement, with the main time/date display moved to the Header for better visibility.

### Dynamic Card Management
- **Persistence:** Selected apps are stored in `localStorage` under `launcher_visibleApps`.
- **Initial Setup:** Defaults to Phone, WhatsApp, Camera, Browser, Emergency, and Family on first run.
- **PRESET_APPS:** A registry maps ID to labels, colors, and actions (Intents or Links).
- **Security Logic:** Cards can only be added or removed when "Modo Configuração" (`lockEdit = false`) is active. This prevents accidental deletions by the user.
- **Add App:** A modal allows selection from common apps (YouTube, Facebook, Instagram, etc.).
- **Delete Action:** Rendered as a separate button (`id="del-{id}"`) attached to the card, visible only in configuration mode.

### Dwell Click Implementation
- **Timing:** 1.5 seconds (20 steps of 75ms).
- **Visuals:** SVG circular progress bar (32px) centered on the trackpad.
- **Logic:** Resets if the cursor moves to a different element ID.

### Voice Engine & Commands
- **Synthesis:** Custom `speak()` function using `window.speechSynthesis` with multi-language support.
- **Recognition:** Integrated `SpeechRecognition` when the assistant is active.
- **Commands:** 
  - *Navigation:* "Subir/Up/Arriba", "Descer/Down/Bajar" (control scroll).
  - *UI Adjustments:* "Aumentar/Zoom in/Más", "Diminuir/Zoom out/Menos" (control font size).
  - *App Control:* "Abrir [Nome do App]" launches the corresponding intent.
  - *Safety:* "Ajuda/Socorro/Help" triggers emergency actions.
  - *System (Offline):* "Lanterna/Flashlight", "Horas/Time", "Bateria/Battery".
- **Toggle:** Voice feedback can be completely muted via the Accessibility menu (Vision category).
- **Offline Support:** Basic commands work without internet if the OS (Android/iOS) has downloaded the local language pack for speech recognition.
- **Flashlight:** A dedicated button in the bottom bar toggles the device flashlight (simulated via a visual overlay).
- **Assistance Feedback:** When voice commands are active, a pulsating animation (scale and glow) is applied to the microphone icon, and a "Listening" indicator with frequency-bars is displayed on the trackpad area.

### Android Intents
- **General Launcher:** `intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end`.
- **Camera:** `intent:#Intent;action=android.media.action.STILL_IMAGE_CAMERA;end`.
- **Browser:** `intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_BROWSER;end`.
- **WhatsApp:** `intent://send#Intent;package=com.whatsapp;scheme=whatsapp;end`.
- **Specific Apps:** `intent://#Intent;package={packageName};scheme=https;end`.

## 5. Persistence Map (LocalStorage)
- `launcher_visibleApps`: JSON array of app IDs.
- `launcher_lockEdit`: Boolean (Safety Lock / Modo Configuração).
- `launcher_dwellEnabled`: Boolean.
- `launcher_highContrast`: Boolean.
- `launcher_darkMode`: Boolean.
- `launcher_reduceMotion`: Boolean.
- `launcher_colorblindMode`: Boolean.
- `launcher_vibrateOnTouch`: Boolean.
- `launcher_trackpadEnabled`: Boolean.
- `launcher_voiceEnabled`: Boolean.
- `launcher_enhancedFeedback`: Boolean.
- `launcher_fontSize`: Integer.
- `launcher_confirmCall`: Boolean.
- `launcher_language`: String ('pt-BR', 'en-US', 'es-ES').
- `launcher_themeMode`: String (preset names or 'custom').
- `launcher_customTheme`: JSON object for user colors.

## 6. Implementation Checklist
- [x] Implement the cursor on z-index 1000+.
- [x] All interactive elements must have a unique `id`.
- [x] Use `AnimatePresence` for modal transitions.
- [x] Trigger haptic feedback on state changes and successful clicks.
- [x] Ensure `viewport` meta prevents manual zoom and forces auto-scaling.
