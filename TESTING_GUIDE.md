# Gova Minimal UI - Testing Guide

## Quick Start

To test the application locally:

```bash
# Start a local server (Python 3)
python3 -m http.server 8000

# Or use any other local server
# Then open: http://localhost:8000
```

## Testing Checklist

### 1. Basic Functionality ✓

#### Altitude Display
- [ ] Page loads and shows "—" initially
- [ ] After GPS lock, shows altitude number
- [ ] Unit label displays correctly (m or ft)
- [ ] Number updates when altitude changes

#### Single Tap (Refresh)
- [ ] Tap anywhere on screen
- [ ] Altitude value briefly changes color (blue)
- [ ] GPS refreshes and updates value
- [ ] Can't spam-tap (debounced to 2 seconds)

#### Long Press (Settings)
- [ ] Press and hold for >500ms
- [ ] Settings sheet slides up from bottom
- [ ] Haptic feedback on mobile (if supported)
- [ ] Moving finger before 500ms cancels long press

### 2. Settings Menu ✓

#### Opening/Closing
- [ ] Long press opens settings
- [ ] Tap outside settings closes it
- [ ] "Fermi" (Close) button closes it
- [ ] Escape key closes it
- [ ] 's' key opens it

#### Unit Switching
- [ ] "Metroj" button switches to meters
- [ ] "Futoj" button switches to feet
- [ ] Active button is highlighted (blue)
- [ ] Main display updates immediately
- [ ] Preference persists after page reload

#### GPS Status
- [ ] Shows "Serĉas GPS..." when searching
- [ ] Shows "GPS ŝlosita" when locked
- [ ] Shows accuracy (e.g., "Precizeco: ±5 m")
- [ ] Status dot pulses when searching
- [ ] Status dot is green when locked

### 3. Base Height Feature ✓

#### Setting Base Height
- [ ] Tap "Agordi Nunan kiel Bazon" button
- [ ] Toast shows "Baza alteco agordita"
- [ ] "Δ" symbol appears in bottom-left
- [ ] Altitude display switches to relative (shows +/-)
- [ ] Base height info shows in settings (e.g., "Bazo: 100 m")
- [ ] "Forigi Bazon" button becomes enabled

#### Relative Altitude Display
- [ ] Shows "+" prefix for positive values (e.g., "+50")
- [ ] Shows "-" prefix for negative values (e.g., "-25")
- [ ] No prefix for zero (e.g., "0")
- [ ] Updates correctly when altitude changes
- [ ] Works with both meters and feet

#### Clearing Base Height
- [ ] Tap "Forigi Bazon" button
- [ ] Toast shows "Baza alteco forigita"
- [ ] "Δ" symbol disappears
- [ ] Display returns to absolute altitude
- [ ] "Forigi Bazon" button becomes disabled
- [ ] Base height persists after page reload

### 4. Visual Indicators ✓

#### Status Indicator (top-right)
- [ ] Small dot visible in corner
- [ ] Yellow/orange when searching (pulsing)
- [ ] Green when GPS locked
- [ ] Red when error
- [ ] Subtle opacity (not distracting)

#### Base Indicator (bottom-left)
- [ ] "Δ" symbol appears when base height set
- [ ] Hidden when no base height
- [ ] Subtle gray color
- [ ] Doesn't interfere with main display

### 5. Keyboard Shortcuts ✓

- [ ] **Space**: Refreshes GPS
- [ ] **s**: Opens settings
- [ ] **Escape**: Closes settings
- [ ] Shortcuts work when settings closed
- [ ] Escape only works when settings open

### 6. Toast Notifications ✓

- [ ] Appears at bottom-center
- [ ] Auto-dismisses after 3 seconds
- [ ] Shows for:
  - Base height set
  - Base height cleared
  - GPS errors
  - Permission denied
  - No GPS data available

### 7. Responsive Design ✓

#### Mobile (320px - 768px)
- [ ] Altitude fills screen nicely
- [ ] Font size is readable
- [ ] Settings sheet fits screen
- [ ] Touch targets are large enough (44px min)

#### Tablet (768px - 1024px)
- [ ] Altitude scales appropriately
- [ ] Settings sheet centered with max-width

#### Desktop (>1024px)
- [ ] Mouse click works like tap
- [ ] Mouse hold works like long press
- [ ] Right-click context menu prevented
- [ ] Keyboard shortcuts work

### 8. Dark Mode ✓

- [ ] Automatically switches with system preference
- [ ] All text is readable
- [ ] Status indicators visible
- [ ] Settings sheet has proper contrast
- [ ] Toast notifications visible

### 9. Accessibility ✓

#### Screen Reader
- [ ] Altitude value announced when changed
- [ ] Settings modal announced when opened
- [ ] Button states announced (pressed/not pressed)
- [ ] Toast messages announced

#### Keyboard Navigation
- [ ] Can tab through settings controls
- [ ] Focus visible on all interactive elements
- [ ] Focus trapped in settings modal
- [ ] Logical tab order

#### Reduced Motion
- [ ] Animations respect prefers-reduced-motion
- [ ] App still functional without animations

### 10. Error Handling ✓

#### GPS Permission Denied
- [ ] Shows toast with clear message
- [ ] Status indicator shows error (red)
- [ ] Last known value remains visible

#### GPS Unavailable
- [ ] Shows toast explaining GPS not supported
- [ ] Graceful degradation

#### Offline Mode
- [ ] App loads from cache
- [ ] Last known altitude displayed
- [ ] Settings still functional
- [ ] MSL correction skipped (uses cached or WGS84)

#### No GPS Data Yet
- [ ] Shows "—" placeholder
- [ ] "Agordi Nunan kiel Bazon" disabled
- [ ] Toast explains no data available

### 11. Performance ✓

- [ ] Tap response is immediate (<50ms)
- [ ] Long press triggers at exactly 500ms
- [ ] Settings animation is smooth (60fps)
- [ ] No lag when updating altitude
- [ ] Debouncing prevents excessive refreshes

### 12. PWA Functionality ✓

#### Installation
- [ ] Can install as PWA
- [ ] Icon appears on home screen
- [ ] Opens in standalone mode
- [ ] No browser chrome visible

#### Offline
- [ ] Works offline after first visit
- [ ] Service worker caches assets
- [ ] Updates available on next visit

#### Updates
- [ ] Service worker updates to v2
- [ ] Old cache cleared
- [ ] No data loss during update

## Browser Testing Matrix

| Browser | Version | Status |
|---------|---------|--------|
| iOS Safari | 14+ | ✓ Test |
| Chrome Android | 90+ | ✓ Test |
| Chrome Desktop | Latest | ✓ Test |
| Firefox Desktop | Latest | ✓ Test |
| Safari Desktop | Latest | ✓ Test |
| Edge Desktop | Latest | ✓ Test |

## Known Limitations

1. **Long Press on iOS**: May trigger system context menu in some cases
2. **Haptic Feedback**: Only works on devices with vibration API
3. **MSL Correction**: Requires internet connection
4. **GPS Accuracy**: Varies by device and environment (typically ±3-15m)

## Debugging Tips

### Check Console
```javascript
// Open browser console and check for:
// - Service worker registration
// - GPS position updates
// - localStorage values

// View stored data:
console.log('Unit:', localStorage.getItem('gova_unit'));
console.log('Last Alt:', localStorage.getItem('gova_last_altitude'));
console.log('Base Height:', localStorage.getItem('gova_base_height'));
```

### Test GPS Without Moving
```javascript
// Simulate altitude change in console:
Storage.setLastAlt(1500); // Set to 1500m
location.reload(); // Reload to see change
```

### Test Base Height
```javascript
// Set base height manually:
Storage.setBaseHeight(1000); // Set base to 1000m
location.reload();
```

## Reporting Issues

If you find bugs, note:
1. Browser and version
2. Device type (mobile/tablet/desktop)
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors (if any)

## Success Criteria

The implementation is successful if:
- ✅ All basic functionality works
- ✅ Tap and long-press interactions are intuitive
- ✅ Base height feature works correctly
- ✅ Settings persist across sessions
- ✅ No console errors
- ✅ Smooth animations (60fps)
- ✅ Accessible with keyboard and screen reader
- ✅ Works offline
- ✅ Responsive on all screen sizes
