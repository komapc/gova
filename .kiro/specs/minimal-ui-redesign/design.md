# Design: Minimal UI Redesign

## 1. Architecture Overview

The redesign maintains the existing modular architecture while simplifying the UI layer and adding base height functionality.

### 1.1 Component Structure

```
┌─────────────────────────────────┐
│     Main Screen (index.html)    │
│  ┌───────────────────────────┐  │
│  │   Altitude Display        │  │
│  │   (tap/long-press area)   │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │   Settings Sheet (hidden) │  │
│  │   - Unit selector         │  │
│  │   - Base height controls  │  │
│  │   - GPS status            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 1.2 Module Updates

- **storage.js**: Add base height persistence
- **units.js**: Add relative altitude calculation
- **app.js**: Implement tap/long-press detection and settings UI
- **main.css**: Simplify to minimal design
- **index.html**: Remove visible UI elements, add settings sheet

## 2. Detailed Design

### 2.1 HTML Structure Changes

**Main Screen (index.html)**:
```html
<body>
  <!-- Full-screen tap area -->
  <main id="main" class="fullscreen-tap-area" aria-label="Altitude">
    <div class="altitude-display">
      <span id="altitude-value" class="altitude-value" aria-live="polite">—</span>
      <span id="altitude-unit" class="altitude-unit">m</span>
    </div>
    
    <!-- Subtle indicators (hidden by default) -->
    <div id="status-indicator" class="status-indicator" aria-hidden="true"></div>
    <div id="base-indicator" class="base-indicator hidden" aria-label="Relative mode">Δ</div>
  </main>

  <!-- Settings Sheet (slides up on long press) -->
  <div id="settings-overlay" class="settings-overlay hidden" role="dialog" aria-modal="true">
    <div id="settings-sheet" class="settings-sheet">
      <div class="settings-handle" aria-hidden="true"></div>
      
      <!-- GPS Status -->
      <div class="settings-section">
        <div class="status-row">
          <span class="status-dot" id="status-dot" data-state="searching"></span>
          <span id="status-text">Searching GPS...</span>
        </div>
        <p id="accuracy-text" class="accuracy-text"></p>
      </div>

      <!-- Unit Selector -->
      <div class="settings-section">
        <label class="settings-label">Unit</label>
        <div class="unit-selector" role="group">
          <button id="unit-m" class="unit-btn active" data-unit="m">Meters</button>
          <button id="unit-ft" class="unit-btn" data-unit="ft">Feet</button>
        </div>
      </div>

      <!-- Base Height -->
      <div class="settings-section">
        <label class="settings-label">Base Height</label>
        <div class="base-height-controls">
          <button id="btn-set-base" class="btn-secondary">Set Current as Base</button>
          <button id="btn-clear-base" class="btn-secondary" disabled>Clear Base</button>
          <p id="base-height-info" class="info-text"></p>
        </div>
      </div>

      <!-- Close Button -->
      <button id="btn-close-settings" class="btn-primary">Close</button>
    </div>
  </div>

  <script src="js/storage.js"></script>
  <script src="js/units.js"></script>
  <script src="js/gps.js"></script>
  <script src="js/app.js"></script>
  <script src="js/sw-register.js"></script>
</body>
```

### 2.2 Storage Module Extensions (storage.js)

Add base height management:

```javascript
// New functions to add:

/** @returns {number|null} */
function getBaseHeight() {
  const val = safeGet(KEYS.BASE_HEIGHT);
  if (val === null) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

/** @param {number} meters */
function setBaseHeight(meters) {
  safeSet(KEYS.BASE_HEIGHT, meters);
}

function clearBaseHeight() {
  safeRemove(KEYS.BASE_HEIGHT);
}

/** @returns {boolean} */
function hasBaseHeight() {
  return getBaseHeight() !== null;
}
```

### 2.3 Units Module Extensions (units.js)

Add relative altitude calculation:

```javascript
/**
 * Calculates relative altitude if base height is set
 * @param {number} currentMeters - Current altitude in meters
 * @param {number|null} baseMeters - Base height in meters
 * @returns {number} - Relative or absolute altitude
 */
function getDisplayAltitude(currentMeters, baseMeters) {
  if (baseMeters === null) return currentMeters;
  return currentMeters - baseMeters;
}

/**
 * Formats altitude with optional relative indicator
 * @param {number|null} meters - Altitude in meters
 * @param {'m'|'ft'} unit - Unit
 * @param {boolean} isRelative - Whether showing relative altitude
 * @returns {{ value: string, unit: string, prefix: string }}
 */
function formatAltitude(meters, unit, isRelative = false) {
  if (meters === null || meters === undefined || isNaN(meters)) {
    return { value: '—', unit: unit === 'ft' ? 'ft' : 'm', prefix: '' };
  }

  const prefix = isRelative ? (meters >= 0 ? '+' : '') : '';
  
  if (unit === 'ft') {
    const ft = toFeet(meters);
    return {
      value: Math.round(ft).toLocaleString('en'),
      unit: 'ft',
      prefix
    };
  }

  return {
    value: Math.round(meters).toLocaleString('en'),
    unit: 'm',
    prefix
  };
}
```

### 2.4 App Logic (app.js)

**Tap/Long-Press Detection**:

```javascript
let touchStartTime = 0;
let longPressTimer = null;
const LONG_PRESS_DURATION = 500; // ms

function handleTouchStart(e) {
  touchStartTime = Date.now();
  
  longPressTimer = setTimeout(() => {
    // Long press detected - open settings
    openSettings();
    navigator.vibrate?.(50); // Haptic feedback if available
  }, LONG_PRESS_DURATION);
}

function handleTouchEnd(e) {
  const touchDuration = Date.now() - touchStartTime;
  
  clearTimeout(longPressTimer);
  
  if (touchDuration < LONG_PRESS_DURATION) {
    // Short tap - refresh
    manualRefresh();
  }
}

function handleTouchMove(e) {
  // Cancel long press if finger moves
  clearTimeout(longPressTimer);
}
```

**Settings Management**:

```javascript
function openSettings() {
  const overlay = document.getElementById('settings-overlay');
  overlay.classList.remove('hidden');
  
  // Update settings UI with current values
  updateSettingsUI();
  
  // Trap focus in modal
  trapFocus(overlay);
}

function closeSettings() {
  const overlay = document.getElementById('settings-overlay');
  overlay.classList.add('hidden');
}

function updateSettingsUI() {
  // Update unit buttons
  const currentUnit = Storage.getUnit();
  document.querySelectorAll('.unit-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.unit === currentUnit);
  });
  
  // Update base height info
  const baseHeight = Storage.getBaseHeight();
  const hasBase = baseHeight !== null;
  
  document.getElementById('btn-clear-base').disabled = !hasBase;
  document.getElementById('base-indicator').classList.toggle('hidden', !hasBase);
  
  if (hasBase) {
    const formatted = Units.formatAltitude(baseHeight, currentUnit);
    document.getElementById('base-height-info').textContent = 
      `Base: ${formatted.value} ${formatted.unit}`;
  } else {
    document.getElementById('base-height-info').textContent = 
      'No base height set';
  }
}
```

**Base Height Controls**:

```javascript
function setBaseHeight() {
  const currentAlt = Storage.getLastAlt();
  if (currentAlt === null) {
    showToast('No GPS data available');
    return;
  }
  
  Storage.setBaseHeight(currentAlt);
  updateSettingsUI();
  updateAltitudeDisplay();
  showToast('Base height set');
}

function clearBaseHeight() {
  Storage.clearBaseHeight();
  updateSettingsUI();
  updateAltitudeDisplay();
  showToast('Base height cleared');
}
```

**Altitude Display Update**:

```javascript
function updateAltitudeDisplay() {
  const currentAlt = Storage.getLastAlt();
  const baseHeight = Storage.getBaseHeight();
  const currentUnit = Storage.getUnit();
  
  if (currentAlt === null) {
    elAltitude.textContent = '—';
    return;
  }
  
  const displayAlt = Units.getDisplayAltitude(currentAlt, baseHeight);
  const formatted = Units.formatAltitude(displayAlt, currentUnit, baseHeight !== null);
  
  elAltitude.textContent = formatted.prefix + formatted.value;
  elUnit.textContent = formatted.unit;
  
  // Show/hide base indicator
  document.getElementById('base-indicator').classList.toggle('hidden', baseHeight === null);
}
```

### 2.5 CSS Design (main.css)

**Minimal Main Screen**:

```css
/* Full-screen tap area */
.fullscreen-tap-area {
  width: 100vw;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}

/* Altitude display - centered, large */
.altitude-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.altitude-value {
  font-family: var(--font-mono);
  font-size: clamp(6rem, 25vw, 16rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  transition: color var(--transition-fast);
}

.altitude-unit {
  font-family: var(--font-mono);
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 400;
  color: var(--color-text-secondary);
  opacity: 0.6;
}

/* Tap feedback */
.fullscreen-tap-area:active .altitude-value {
  color: var(--color-accent);
  transform: scale(0.98);
}

/* Subtle status indicator (top-right corner) */
.status-indicator {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  opacity: 0.4;
  transition: opacity var(--transition-normal);
}

.status-indicator[data-state="searching"] {
  background: var(--color-warning);
  animation: pulse 1.5s ease-in-out infinite;
}

.status-indicator[data-state="error"] {
  background: var(--color-error);
}

/* Base height indicator (bottom-left) */
.base-indicator {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  opacity: 0.3;
}

.base-indicator.hidden {
  display: none;
}
```

**Settings Sheet**:

```css
/* Settings overlay */
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  transition: opacity var(--transition-normal);
}

.settings-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}

/* Settings sheet */
.settings-sheet {
  background: var(--color-bg);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  max-height: 80vh;
  overflow-y: auto;
  transform: translateY(0);
  transition: transform var(--transition-normal);
}

.settings-overlay.hidden .settings-sheet {
  transform: translateY(100%);
}

/* Settings handle */
.settings-handle {
  width: 40px;
  height: 4px;
  background: var(--color-text-secondary);
  opacity: 0.3;
  border-radius: 2px;
  margin: 0 auto 1.5rem;
}

/* Settings sections */
.settings-section {
  margin-bottom: 2rem;
}

.settings-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Unit selector */
.unit-selector {
  display: flex;
  gap: 0.5rem;
}

.unit-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.unit-btn.active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: white;
}

/* Base height controls */
.base-height-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-secondary {
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: white;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.info-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}
```

### 2.6 Interaction Flow Diagram

```
User Action          System Response
───────────          ───────────────
Tap screen     ──>   Trigger GPS refresh
                     Show brief color feedback
                     Update altitude value
                     
Long press     ──>   Vibrate (if available)
(>500ms)             Open settings sheet
                     Show current settings
                     
In Settings:
- Tap unit     ──>   Switch unit
                     Update display
                     Save to localStorage
                     
- Set base     ──>   Save current altitude as base
                     Show "Δ" indicator
                     Display relative altitude
                     
- Clear base   ──>   Remove base height
                     Hide "Δ" indicator
                     Display absolute altitude
                     
- Tap outside  ──>   Close settings
  or Close btn       Return to main screen
```

## 3. Data Flow

### 3.1 Altitude Calculation Flow

```
GPS Position
    ↓
MSL Correction (if online)
    ↓
Store in localStorage
    ↓
Check if base height exists
    ↓
Calculate: display = current - base (if base exists)
    ↓
Format with current unit
    ↓
Update UI
```

### 3.2 State Management

```javascript
// Application state
const state = {
  currentAltitude: null,      // meters (MSL)
  baseHeight: null,           // meters (MSL)
  unit: 'm',                  // 'm' | 'ft'
  gpsStatus: 'searching',     // 'searching' | 'locked' | 'error'
  accuracy: null,             // meters
  isRefreshing: false,
  settingsOpen: false
};
```

## 4. Accessibility Considerations

### 4.1 Screen Reader Support
- Altitude value has `aria-live="polite"` for automatic announcements
- Settings sheet has proper `role="dialog"` and `aria-modal="true"`
- All interactive elements have accessible labels

### 4.2 Keyboard Navigation
- Settings can be opened with keyboard shortcut (e.g., 's' key)
- Tab order flows logically through settings
- Escape key closes settings sheet
- Focus trap within modal

### 4.3 Alternative Interactions
- Desktop: Click for refresh, right-click for settings
- Keyboard: Space for refresh, 's' for settings
- Screen reader: Announce "Tap to refresh, long press for settings"

## 5. Error Handling

### 5.1 GPS Errors
- Show toast notification with error message
- Keep last known value visible
- Update status indicator to error state

### 5.2 Offline Mode
- Use cached MSL altitude if available
- Show subtle offline indicator
- Settings remain functional

### 5.3 Permission Denied
- Show clear instructions in toast
- Provide link to browser settings
- Disable refresh functionality

## 6. Performance Considerations

- Debounce rapid taps (max 1 refresh per 2 seconds)
- Use CSS transforms for animations (GPU-accelerated)
- Lazy-load settings UI elements
- Minimize reflows during altitude updates

## 7. Testing Strategy

### 7.1 Unit Tests
- Storage module: base height CRUD operations
- Units module: relative altitude calculations
- Tap detection: timing thresholds

### 7.2 Integration Tests
- Full refresh flow with base height
- Settings persistence across sessions
- Unit conversion with base height

### 7.3 Manual Testing
- Test on iOS Safari and Chrome Android
- Verify haptic feedback on supported devices
- Test with screen reader (VoiceOver/TalkBack)
- Verify reduced motion preferences

## 8. Migration Strategy

### 8.1 Backward Compatibility
- Existing localStorage keys remain unchanged
- Add new `gova_base_height` key
- Service worker cache version bump

### 8.2 Deployment
1. Deploy new HTML/CSS/JS files
2. Service worker updates cache
3. Users get update on next visit
4. No data loss or migration needed

## 9. Future Enhancements

- Altitude history graph (swipe up gesture)
- Multiple saved base heights with names
- Export altitude data
- Customizable long-press duration
- Gesture customization
