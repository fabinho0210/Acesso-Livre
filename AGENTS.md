# Acesso Livre - Accessibility Launcher System Instructions

This document outlines the core principles, design system, and functional logic for the "Acesso Livre" Accessibility Launcher. Use these instructions to maintain consistency across different versions or platforms.

## 1. Core Mission
The launcher is designed for users with severe motor impairments (Disarthria, Cerebral Palsy, Reduced Mobility) who cannot use standard touch interfaces. It bridges the gap between the user and the smartphone through a virtual mouse, voice commands, and dwell-clicking.

## 2. Accessibility Guidelines (WCAG + Custom)
- **High Contrast Mode:** Forced black/white/yellow palette with 4px black borders on every interactive element.
- **Font Scale:** Support for `small` (text-sm), `medium` (text-base), and `large` (text-xl) global scales.
- **Touch Targets:** Minimum 44x44px. In the launcher, buttons are large (at least 160px height on mobile).
- **Dwell Clicking:** Automatic activation when a cursor hovers over an element for 1.5s.
- **Visual Feedback:** 
  - Hover states: Scale up (1.05x) and shadow intensity.
  - Active states: Translation (4px down/right) to simulate a physical button press.

## 3. Design System (The "Neo-Accessibility" Look)
- **Theme Colors:** 
  - Yellow: `#facc15` (Primary/High Contrast)
  - Blue: `bg-blue-400`
  - Green: `bg-green-400`
  - Purple: `bg-purple-500`
- **Architecture:**
  - Header: 80px (mobile) to 96px (desktop).
  - Main Grid: Reactive columns (2 cols on small mobile, up to 5 on wide screens).
  - Trackpad Area: Takes 60% of the screen height in Assistive Mode.
- **Typography:**
  - Font: Inter (Sans-serif).
  - Weights: Black (900) for titles, Bold (700) for actions.

## 4. Functional Logic (Critical)
### Assistive Cursor Strategy
- **Duality:** The cursor position is stored in percentages (`0-100` for X/Y) to be resolution-independent.
- **Mapping:** To detect elements under the cursor, use `document.elementFromPoint(xPx, yPx)` after converting percentages to pixels, accounting for the header offset.
- **Trackpad:** Captures `touchMove` or mouse-drag and calculates proportional movement relative to the trackpad's container size.

### Dwell Click Implementation
- **Timing:** 1.5 seconds.
- **Visuals:** A 64px circular SVG stroke that fills up as time passes.
- **Reset:** If the cursor moves to a new element ID or back to the trackpad, the timer MUST reset immediately.

### Voice Engine (Internationalized)
- Support for `pt-BR`, `en-US`, and `es-ES`.
- Commands must be fuzzy-matched (e.g., "cima" or "top" should both move the cursor up).
- **Zoom Controls:** "Aumentar Zoom / Zoom In", "Diminuir Zoom / Zoom Out".
- **View Reset:** "Resetar / Reset / Centralizar" (sets zoom to 1x and resets pan).

## 5. Mobile & PWA Optimization
- **Full Viewport:** Use `100dvh` to handle mobile address bars correctly.
- **Safe Areas:** Apply `padding-top: env(safe-area-inset-top)` and `padding-bottom: env(safe-area-inset-bottom)`.
- **Manifest:** Standalone display mode with `mouse` icon as the launcher identifier.

## 6. Implementation Checklist for New Projects
- [ ] Initialize `localStorage` for `dwellEnabled`, `highContrast`, and `lang`.
- [ ] Implement `triggerHaptic(HAPTIC_PATTERNS.SUCCESS)` on every successful click.
- [ ] Ensure the cursor is rendered on a high z-index (300+) above all UI but below settings modals.
- [ ] All buttons must have an `id` that matches the cursor detection logic.
- [ ] Disable standard touch/scroll when Assistive Mode is active to prevent unintentional swipes.
