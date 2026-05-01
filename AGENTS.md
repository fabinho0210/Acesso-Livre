# Acesso Livre - Accessibility Launcher System Instructions

This document outlines the core principles, design system, and functional logic for the "Acesso Livre" Accessibility Launcher. Use these instructions to maintain consistency across different versions or platforms.

## 1. Core Mission
The launcher is designed for users with severe motor impairments (Disarthria, Cerebral Palsy, Reduced Mobility) and visual/hearing needs. It bridges the gap between the user and the smartphone through a virtual mouse (trackpad), voice synthesis, and dwell-clicking.

## 2. Accessibility Guidelines (WCAG + Custom)
- **High Contrast Mode:** Forced black/white/yellow palette with 4px black borders on every interactive element.
- **Font Scale:** Support for dynamic font sizing (default 22px, ranges up to 48px).
- **Touch Targets:** Minimum 44x44px. Buttons are large (square grid layout, aspect-square).
- **Dwell Clicking:** Automatic activation when a cursor hovers over an element for 1.5s.
- **Visual Feedback:** 
  - Hover states: Scale up (1.05x) and enhanced shadows.
  - Active states: Translation (4px down/right) to simulate physical button press.
- **Reading Line:** A horizontal guide that follows the cursor to assist in tracking text.

## 3. Design System (Neo-Brutalism)
- **Style:** Thick black borders (4px), solid black shadows (`shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`), and vibrant solid colors.
- **Theme Colors:** 
  - Primary: `#facc15` (Yellow)
  - Secondary: Green (WhatsApp/Success), Blue (System), Red (Emergency/Stop).
  - Neutrals: Zinc-100/900 for utility buttons.
- **Architecture:**
  - Header (80px): Logo, Settings, Accessibility trigger.
  - Main Grid: Scrollable area for dynamic app cards.
  - Nav Bar (96px): Back, Help, Home, Menu.
  - Trackpad Area (32dvh): Proportional control area for the virtual cursor.

## 4. Functional Logic (Critical)

### Assistive Cursor & Trackpad
- **Resolution Independence:** Cursor position is stored as percentages (0-100% for X/Y).
- **Mapping:** `document.elementFromPoint(xPx, yPx)` translates percentages to screen coordinates, adjusted for the scrollable main area.
- **Toggle:** Trackpad can be disabled in Settings to allow standard touch interaction.

### Dynamic Card Management
- **Persistence:** Selected apps are stored in `localStorage` under `launcher_visibleApps`.
- **PRESET_APPS:** A registry maps ID to labels, colors, and actions (Intents or Links).
- **Security Logic:** Cards can only be added or removed when "Modo Editar" (`lockEdit = false`) is active. This prevents accidental deletions by the user.
- **Delete Action:** Rendered as a separate button (`id="del-{id}"`) attached to the card, visible only in edit mode.

### Dwell Click Implementation
- **Timing:** 1.5 seconds (20 steps of 75ms).
- **Visuals:** SVG circular progress bar (32px) centered on the trackpad.
- **Logic:** Resets if the cursor moves to a different element ID.

### Voice Engine
- **Synthesis:** Custom `speak()` function using `window.speechSynthesis` (pt-BR).
- **Toggle:** Voice feedback can be completely muted via the Accessibility menu.
- **Persistence:** `launcher_voiceEnabled` in `localStorage`.

### Android Intents
- **General Launcher:** `intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end`.
- **Specific Apps:** `intent://#Intent;package={packageName};scheme=https;end`.

## 5. Persistence Map (LocalStorage)
- `launcher_visibleApps`: JSON array of app IDs.
- `launcher_lockEdit`: Boolean (Safety Lock).
- `launcher_dwellEnabled`: Boolean.
- `launcher_highContrast`: Boolean.
- `launcher_darkMode`: Boolean.
- `launcher_trackpadEnabled`: Boolean.
- `launcher_voiceEnabled`: Boolean.
- `launcher_fontSize`: Integer.
- `launcher_confirmCall`: Boolean.

## 6. Implementation Checklist
- [x] Implement the cursor on z-index 1000+.
- [x] All interactive elements must have a unique `id`.
- [x] Use `AnimatePresence` for modal transitions.
- [x] Trigger haptic feedback on state changes and successful clicks.
