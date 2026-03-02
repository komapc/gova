# Tasks: Minimal UI Redesign

## 1. Storage Module Updates

### 1.1 Add base height storage functions
- [ ] Add `BASE_HEIGHT` key constant to KEYS object
- [ ] Implement `getBaseHeight()` function
- [ ] Implement `setBaseHeight(meters)` function
- [ ] Implement `clearBaseHeight()` function
- [ ] Implement `hasBaseHeight()` helper function

## 2. Units Module Updates

### 2.1 Add relative altitude calculation
- [ ] Implement `getDisplayAltitude(currentMeters, baseMeters)` function
- [ ] Update `formatAltitude()` to accept `isRelative` parameter
- [ ] Add prefix ('+'/'-') support for relative values
- [ ] Update return type to include `prefix` field

## 3. HTML Structure Redesign

### 3.1 Simplify main screen
- [ ] Remove header, footer, and visible controls from index.html
- [ ] Create fullscreen tap area with altitude display
- [ ] Add subtle status indicator (top-right corner)
- [ ] Add base height indicator (bottom-left, hidden by default)

### 3.2 Create settings sheet
- [ ] Add settings overlay with backdrop
- [ ] Create settings sheet with handle
- [ ] Add GPS status section
- [ ] Add unit selector section
- [ ] Add base height controls section
- [ ] Add close button

## 4. CSS Styling

### 4.1 Minimal main screen styles
- [ ] Style fullscreen tap area (centered, full viewport)
- [ ] Style altitude display (large, monospace font)
- [ ] Add tap feedback animation
- [ ] Style status indicator (subtle, corner-positioned)
- [ ] Style base height indicator (Δ symbol)

### 4.2 Settings sheet styles
- [ ] Style settings overlay (backdrop blur)
- [ ] Style settings sheet (bottom sheet, rounded corners)
- [ ] Add slide-up animation
- [ ] Style settings sections and labels
- [ ] Style unit selector buttons
- [ ] Style base height controls
- [ ] Ensure dark mode compatibility

### 4.3 Responsive design
- [ ] Test on mobile viewports (320px - 768px)
- [ ] Test on tablet viewports (768px - 1024px)
- [ ] Test on desktop viewports (>1024px)
- [ ] Verify font scaling with clamp()

## 5. App Logic Implementation

### 5.1 Tap and long-press detection
- [ ] Implement touch event listeners (touchstart, touchend, touchmove)
- [ ] Implement mouse event listeners for desktop (mousedown, mouseup)
- [ ] Add long-press timer (500ms threshold)
- [ ] Add haptic feedback for long-press (if available)
- [ ] Cancel long-press on touch move
- [ ] Prevent context menu on long-press

### 5.2 Refresh functionality
- [ ] Implement `manualRefresh()` function for tap
- [ ] Add debouncing (prevent rapid taps)
- [ ] Add visual feedback during refresh
- [ ] Update altitude display after refresh
- [ ] Handle refresh errors gracefully

### 5.3 Settings management
- [ ] Implement `openSettings()` function
- [ ] Implement `closeSettings()` function
- [ ] Implement `updateSettingsUI()` function
- [ ] Add focus trap for modal accessibility
- [ ] Handle escape key to close settings
- [ ] Handle backdrop click to close settings

### 5.4 Unit switching
- [ ] Add click handlers for unit buttons
- [ ] Update active state on unit buttons
- [ ] Save unit preference to localStorage
- [ ] Update altitude display with new unit
- [ ] Broadcast unit change (BroadcastChannel)

### 5.5 Base height functionality
- [ ] Implement `setBaseHeight()` function
- [ ] Implement `clearBaseHeight()` function
- [ ] Update altitude calculation to use base height
- [ ] Show/hide base indicator based on state
- [ ] Update settings UI with base height info
- [ ] Add toast notifications for base height actions

### 5.6 Altitude display updates
- [ ] Modify `updateAltitudeDisplay()` to handle relative altitude
- [ ] Add prefix (+/-) for relative values
- [ ] Update base indicator visibility
- [ ] Ensure smooth transitions

### 5.7 Toast notifications
- [ ] Create toast notification component
- [ ] Implement `showToast(message)` function
- [ ] Add auto-dismiss after 3 seconds
- [ ] Style toast (bottom-center, subtle)

## 6. Accessibility Improvements

### 6.1 ARIA attributes
- [ ] Add aria-live to altitude value
- [ ] Add role="dialog" to settings overlay
- [ ] Add aria-modal="true" to settings
- [ ] Add aria-label to interactive elements
- [ ] Add aria-pressed to unit buttons

### 6.2 Keyboard navigation
- [ ] Add keyboard shortcut for settings (e.g., 's' key)
- [ ] Add escape key handler for closing settings
- [ ] Implement focus trap in settings modal
- [ ] Ensure logical tab order
- [ ] Add visible focus indicators

### 6.3 Screen reader support
- [ ] Add screen reader instructions for tap/long-press
- [ ] Announce altitude changes
- [ ] Announce GPS status changes
- [ ] Announce base height actions

## 7. Error Handling

### 7.1 GPS error handling
- [ ] Show toast for GPS errors
- [ ] Update status indicator on error
- [ ] Maintain last known value on error
- [ ] Add retry logic for transient errors

### 7.2 Permission handling
- [ ] Detect permission denied state
- [ ] Show clear instructions in toast
- [ ] Provide link to browser settings (if possible)
- [ ] Disable refresh when permission denied

### 7.3 Offline handling
- [ ] Detect offline state
- [ ] Show subtle offline indicator
- [ ] Use cached MSL altitude
- [ ] Ensure settings work offline

## 8. Testing

### 8.1 Unit tests
- [ ] Test storage module base height functions
- [ ] Test units module relative altitude calculation
- [ ] Test tap/long-press timing logic
- [ ] Test altitude formatting with prefix

### 8.2 Integration tests
- [ ] Test full refresh flow with base height
- [ ] Test settings persistence across page reloads
- [ ] Test unit conversion with base height
- [ ] Test offline mode functionality

### 8.3 Manual testing
- [ ] Test on iOS Safari (iPhone)
- [ ] Test on Chrome Android
- [ ] Test on desktop Chrome/Firefox
- [ ] Test with VoiceOver (iOS)
- [ ] Test with TalkBack (Android)
- [ ] Test with keyboard only
- [ ] Test with reduced motion enabled
- [ ] Test in dark mode
- [ ] Test in light mode

## 9. Documentation

### 9.1 Code documentation
- [ ] Add JSDoc comments to new functions
- [ ] Update existing comments for modified functions
- [ ] Document interaction patterns in comments

### 9.2 User documentation
- [ ] Add onboarding hint for first-time users (optional)
- [ ] Update manifest.json description if needed
- [ ] Consider adding help text in settings

## 10. Cleanup and Optimization

### 10.1 Remove unused code
- [ ] Remove location name functionality (js/location-name.js)
- [ ] Remove unused DOM element references
- [ ] Remove unused CSS classes
- [ ] Update service worker cache list

### 10.2 Performance optimization
- [ ] Minimize reflows during updates
- [ ] Use CSS transforms for animations
- [ ] Debounce rapid interactions
- [ ] Optimize event listener attachment

### 10.3 Code quality
- [ ] Run linter (if available)
- [ ] Check for console errors
- [ ] Verify no memory leaks
- [ ] Test battery impact on mobile

## 11. Deployment

### 11.1 Pre-deployment
- [ ] Bump service worker cache version
- [ ] Update manifest.json if needed
- [ ] Test PWA installation
- [ ] Verify offline functionality

### 11.2 Deployment
- [ ] Deploy to Vercel (or hosting platform)
- [ ] Verify service worker updates
- [ ] Test on production URL
- [ ] Monitor for errors

### 11.3 Post-deployment
- [ ] Verify existing users get update
- [ ] Check localStorage migration
- [ ] Monitor error logs
- [ ] Gather user feedback

## Task Summary

- Total tasks: 95
- Estimated effort: 2-3 days for experienced developer
- Priority: High (core functionality redesign)
- Dependencies: None (self-contained)
