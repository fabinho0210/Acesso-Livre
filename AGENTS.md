# Acesso Livre - Accessibility Launcher System Instructions

This document outlines the core principles, design system, and functional logic for the "Acesso Livre" Accessibility Launcher. It serves as the definitive guide for maintaining consistency, performance, and accessibility standards across the Native Android implementation.

## 1. Core Mission
The launcher is designed for users with severe motor impairments (Disarthria, Cerebral Palsy, Reduced Mobility) and visual/hearing needs. It empowers users to control their smartphones through an assistive trackpad, voice commands, and dwell-clicking, bridging the gap between physical limitations and digital interaction.

## 2. Technical Architecture (Native Android)
- **Framework:** Jetpack Compose for a modern, reactive, and declarative UI.
- **State Management:** `LauncherViewModel` utilizing `MutableStateFlow` and `StateFlow` for real-time reactivity.
- **Background Tasks:** Kotlin Coroutines (`viewModelScope`) for non-blocking operations like listing installed apps, ensuring high performance even on basic/low-end devices.
- **Persistence:** `AppPreferences` wrapping `SharedPreferences` for storing favorite apps and accessibility settings.
- **Inter-Process Communication:** `LauncherAccessibilityService` for global OS commands (Back, Recent Apps, Notifications).

## 3. Design System: Neo-Brutalism
- **Visual Style:** 
  - Thick black borders (4px) on all interactive elements.
  - Hard black shadows (`8px 8px 0px 0px rgba(0,0,0,1)`).
  - High-contrast, vibrant solid colors.
- **Theme Colors:**
  - **Primary:** `#facc15` (Yellow) - used for the main background and key highlights.
  - **Secondary:** Green (Success/WhatsApp), Blue (System Info), Red (Emergency/Low Battery).
  - **Neutral:** Zinc-100/900 for utility buttons and secondary backgrounds.
- **Visual & Haptic Feedback:**
  - **Hover:** Scale up (1.05x) and enhanced drop shadows.
  - **Active:** Elements "translate" 4px down/right to simulate a physical press.
  - **Haptics:** High-frequency vibration (5ms) on touch and "success" vibration on click/action completion.

## 4. Accessibility Features (Critical)

### Assistive Cursor & Trackpad Area
- **Logic:** The trackpad maps local touch coordinates to screen-wide percentages (0-100%).
- **Targeting:** `LauncherViewModel` calculates the "active" element by comparing cursor percentages against registered element bounds (`RectData`).
- **Indicator:** A high-contrast red cursor represents the assistive pointer.
- **Listening State:** The trackpad area provides visual feedback (pulsating borders) when voice commands are active.

### Dwell Clicking
- **Activation:** 1.5s (configured in ViewModel via `Handler`).
- **Resets:** Resets instantly if the cursor moves to a different element ID.
- **Visuals:** A progress indicator (handled in code-behind) confirms the dwell timer.

### Voice Assistant (Integrated SDK)
- **Engine:** Custom `VoiceAssistant.kt` wrapper over `android.speech.tts.TextToSpeech` and `SpeechRecognizer`.
- **Feedback:** Real-time state updates (`isListening` StateFlow) to toggle UI indicators.
- **Commands (Multi-language Support):**
  - **Navigation:** "Subir/Descer", "Up/Down".
  - **System:** "Lanterna/Flashlight", "Horas/Time", "Bateria/Battery".
  - **Apps:** "Abrir [Nome do App]".
  - **Accessibility:** "Ajuda/Socorro" for emergency/tutorial.

### Accessibility Service Integration
- **Service:** `LauncherAccessibilityService` allows the launcher to perform global UI actions.
- **Commands:** `GLOBAL_ACTION_BACK`, `GLOBAL_ACTION_RECENTS`, `GLOBAL_ACTION_NOTIFICATIONS`.

## 5. Native Logic & Performance

### Application Management
- **Permissions:** 
  - `QUERY_ALL_PACKAGES`: Essential for listing installed apps on API 30+.
  - `CAMERA` & `FLASHLIGHT`: For the dedicated flashlight feature.
  - `RECORD_AUDIO`: For voice commands.
- **App Loading:** Done in `Dispatchers.IO` to prevent UI jank. Only apps with `CATEGORY_LAUNCHER` are filtered for the selection modal.
- **Intents:** Robust error handling (`ActivityNotFoundException`) ensures the launcher never crashes when launching 3rd party apps.

### Battery & Connectivity
- **Monitoring:** `BroadcastReceiver` in `LauncherViewModel` for real-time battery level and state tracking.

### SOS & Emergency
- **Logic:** Sends an SMS to the `sos_contact` stored in preferences.
- **Content:** Includes a Google Maps URL with latitude/longitude fetched via `LocationManager`.
- **Activation:** Voice command "Socorro/Emergência" or a dedicated red SOS button.

### Tutorial & First Run
- **Logic:** Checks `isFirstRun` and `tutorialEnabled`.
- **Voice Help:** Explains trackpad and dwell-clicking logic on first launch.
- **Toggle:** Can be disabled via "Desativar tutorial" voice command or in the configuration menu.

## 6. Persistence Map (Preferences)
- `favorites`: Set of package names for the main grid.
- `lock_edit`: Boolean indicating if "Modo Configuração" is disabled.
- `dwell_enabled`: Boolean for the dwell-click helper.
- `font_size`: Float for dynamic text scaling (Default: 22f).
- `theme_mode`: String (CLASSIC, CLOUD, NIGHT, OCEAN).
- `sos_contact`: String (Phone number for emergency SMS).
- `tutorial_enabled`: Boolean (Controls the opening tutorial).

## 7. Build & Deployment (CI/CD)
- **Environment:** Node.js 24+ for the deployment runner.
- **Build Script:** Native Android build is handled via Gradle (`./gradlew assembleDebug`).
- **PWA Mirroring:** The `index.html` in the root acts as a fallback landing page for the GitHub Pages deployment to prevent 404 errors during distribution.

## 8. Implementation Checklist
- [x] Assistive cursor on z-index 1000+.
- [x] All interactive elements have a unique ID registered in `LauncherViewModel`.
- [x] Fullscreen mode without ActionBar for maximum screen real estate.
- [x] Haptic feedback on all critical interactions.
- [x] High-performance app list loading (Async/Coroutines).
- [x] Flashlight toggle with hardware compatibility.
- [x] Dynamic grid for favorite apps.

