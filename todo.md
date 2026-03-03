# Gova TODO List

## 📱 Android App (Current focus)
- [x] Fix syntax and logic in `MainActivity.kt`
- [ ] Verify Android build locally or via CI
- [x] Implement EGM96 Geoid correction for accurate MSL altitude
- [ ] Implement background GPS monitoring
- [ ] Add home screen widget
- [ ] Add notifications for altitude changes
- [ ] Optimize battery consumption
- [ ] **Android Watch (Wear OS)**
    - [ ] Create Wear OS module
    - [ ] Design complication for altitude
    - [ ] Optimize UI for small screens
- [ ] **Google Play Store**
    - [ ] Register Google Play Developer account ($25)
    - [ ] Prepare store listing (Espéranto, English)
    - [ ] Upload signed AAB (Android App Bundle)

## 🌐 PWA Enhancements
- [ ] **Installability**
    - [ ] Add "Install" button in settings
    - [ ] Add screenshots to `manifest.json`
    - [ ] Improve icon set (maskable icons)
- [ ] **Offline Mode**
    - [x] Cache Open-Elevation API responses (Persistent)
    - [ ] Add "Offline" indicator
    - [ ] Improve Service Worker strategy
- [ ] **Data & Analytics**
    - [x] Altitude history graphs (last 24h, 7d, 30d)
    - [x] Export data (JSON/CSV)
    - [x] Statistics page (max/min altitude)
    - [x] Create `points.html` for saved locations
- [ ] **User Experience (UX)**
    - [ ] Haptic feedback (vibration)
    - [ ] Sound notifications
    - [ ] Theme selector (Dark/Light)
    - [ ] Language selector (eo/en/others)
- [ ] **Geolocation**
    - [ ] Show coordinates (lat/lon)
    - [ ] Reverse geocoding (place names)
    - [x] Save favorite locations (basic implementation)

## 🛠 Maintenance & Infrastructure
- [ ] Improve test coverage for Storage and Units modules
- [ ] Automate CI/CD for both PWA and Android App
- [ ] Update documentation and user guide (UZANTO_GVIDILO.md)
