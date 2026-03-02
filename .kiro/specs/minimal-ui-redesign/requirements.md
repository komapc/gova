# Requirements: Minimal UI Redesign

## 1. Overview

Transform Gova's interface into an ultra-minimal design that shows only the altitude value by default, with all controls and information hidden until user interaction.

## 2. User Stories

### 2.1 As a user, I want to see only the altitude number on the main screen
So that I can quickly glance at my current elevation without visual clutter.

### 2.2 As a user, I want to refresh the altitude with a single click/tap
So that I can manually update my position when needed.

### 2.3 As a user, I want to access settings with a long press/hold
So that I can configure units and base height without cluttering the main interface.

### 2.4 As a user, I want to set a base height reference point
So that I can measure relative altitude changes (e.g., floors climbed, elevation gain on a hike).

### 2.5 As a user, I want to switch between meters and feet
So that I can use my preferred measurement system.

## 3. Acceptance Criteria

### 3.1 Main Screen Display
- **AC 3.1.1**: The main screen displays only the altitude value and unit (e.g., "1234 m")
- **AC 3.1.2**: No visible buttons, status indicators, or location names are shown by default
- **AC 3.1.3**: The altitude value is centered and uses a large, readable font
- **AC 3.1.4**: The screen uses the full viewport height

### 3.2 Single Click/Tap Interaction
- **AC 3.2.1**: A single click/tap anywhere on the screen triggers a manual GPS refresh
- **AC 3.2.2**: During refresh, a subtle visual feedback is shown (e.g., brief color change or animation)
- **AC 3.2.3**: The refresh completes within 15 seconds or shows an error
- **AC 3.2.4**: Multiple rapid clicks are debounced to prevent excessive API calls

### 3.3 Long Press/Hold Interaction
- **AC 3.3.1**: A long press (>500ms) anywhere on the screen opens the settings menu
- **AC 3.3.2**: The long press does not trigger a refresh action
- **AC 3.3.3**: Visual feedback indicates when the long press threshold is reached
- **AC 3.3.4**: The settings menu slides up from the bottom as a modal sheet

### 3.4 Settings Menu
- **AC 3.4.1**: Settings menu contains unit selector (meters/feet)
- **AC 3.4.2**: Settings menu contains base height configuration
- **AC 3.4.3**: Settings menu can be dismissed by tapping outside or swiping down
- **AC 3.4.4**: Settings menu shows current GPS status and accuracy
- **AC 3.4.5**: Settings changes are saved immediately to localStorage

### 3.5 Base Height Feature
- **AC 3.5.1**: User can set current altitude as base height with a button
- **AC 3.5.2**: When base height is set, main screen shows relative altitude (current - base)
- **AC 3.5.3**: User can clear/reset base height to show absolute altitude
- **AC 3.5.4**: Base height is persisted across sessions
- **AC 3.5.5**: Base height indicator shows when relative mode is active (subtle visual cue)

### 3.6 Visual Design
- **AC 3.6.1**: Design maintains dark/light mode support
- **AC 3.6.2**: Animations are smooth and respect prefers-reduced-motion
- **AC 3.6.3**: Touch targets meet minimum accessibility standards (44x44px)
- **AC 3.6.4**: Color contrast meets WCAG AA standards

### 3.7 Error Handling
- **AC 3.7.1**: GPS errors show a brief toast notification
- **AC 3.7.2**: Offline status is indicated subtly (e.g., small icon)
- **AC 3.7.3**: When GPS is unavailable, last known value is shown with indicator
- **AC 3.7.4**: Permission denied shows clear instructions

### 3.8 Backward Compatibility
- **AC 3.8.1**: Existing localStorage data (unit preference, last altitude) is preserved
- **AC 3.8.2**: Service worker continues to cache for offline use
- **AC 3.8.3**: PWA manifest and icons remain functional

## 4. Non-Functional Requirements

### 4.1 Performance
- Long press detection must be responsive (<50ms after threshold)
- Settings menu animation should be smooth (60fps)
- GPS refresh should not block UI interactions

### 4.2 Accessibility
- Screen readers announce altitude changes
- Long press interaction has alternative for users with motor impairments
- Focus management in settings menu follows best practices

### 4.3 Browser Support
- Works on modern mobile browsers (iOS Safari, Chrome Android)
- Graceful degradation for browsers without touch events
- Desktop support with mouse events (click/long-click)

## 5. Out of Scope

- Multiple saved base height locations
- Altitude history/tracking over time
- Sharing altitude data
- Additional settings beyond units and base height
- Location name display (removed for minimalism)

## 6. Open Questions

1. Should the settings menu include a manual refresh button, or is tap-to-refresh sufficient?
2. Should base height show as "+50m" or just "50" when in relative mode?
3. Should there be a visual indicator that the screen is tappable/long-pressable?
4. What additional settings might be useful in the "maybe more" category?

## 7. Dependencies

- Existing GPS module (js/gps.js)
- Existing storage module (js/storage.js)
- Existing units module (js/units.js)
- Touch event APIs
- localStorage API

## 8. Risks

- Long press might conflict with browser's native context menu on some devices
- Users might not discover the long press interaction without onboarding
- Base height feature adds complexity to altitude calculation logic
