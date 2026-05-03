# Gova — Plano por Venonta Etapo

> **Noto (Ĝisdatigo):** La Android-aplikaĵo estis finfine elektita kaj efektivigita kiel **plene nativa aplikaĵo** (per Kotlin kaj Jetpack Compose) por utiligi la aparatan barometron, anstataŭ uzi Capacitor aŭ TWA. Vidu `docs/plans/ANDROID_APP_PLAN.md` kaj la `gova-android` dosierujon.

## Nuna Stato
Gova estas funkcianta PWA (Progressive Web App) kun:
- ✓ GPS-bazita alteco-monitorado
- ✓ MSL (marnivelo) korekcio per Open-Elevation API
- ✓ Relativa alteco-mezurado (baza alteco)
- ✓ Metroj/Futoj konverto
- ✓ Minimuma, tuŝ-bazita UI
- ✓ Offline-subteno per Service Worker
- ✓ localStorage por datumoj-persistado
- ✓ Bazaj testoj por Units kaj Storage moduloj

## Venonta Etapo: Elektoj

### Opcio 1: Plibonigi PWA-Sperton ⭐ REKOMENDITA
**Kial:** PWA estas jam funkcianta, facile distribuebla, kaj atingas iOS + Android sen aparta kodo.

**Taskoj:**
1. **Instaleblo-Plibonigoj**
   - Aldoni "Instali" butonon en agordoj
   - Aldoni ekrankopiojn al manifest.json
   - Plibonigi ikono-aron (maskable icons)

2. **Offline-Plibonigoj**
   - Kaŝmemori Open-Elevation respondojn
   - Aldoni "Offline" indikilon
   - Plibonigi Service Worker strategion

3. **Datumoj kaj Analitiko**
   - Alteco-historio (grafikoj)
   - Eksporti datumojn (JSON/CSV)
   - Statistikoj (maksimuma/minimuma alteco)

4. **UX-Plibonigoj**
   - Haptic feedback (vibrado)
   - Sonaj sciigoj
   - Temo-elektilo (malhela/hela)
   - Lingvo-elektilo (eo/en/aliaj)

5. **Geolokado-Plibonigoj**
   - Montri koordinatojn (lat/lon)
   - Loko-nomo per reverse geocoding
   - Konservi favoritajn lokojn

**Tempo:** 2-3 semajnoj
**Komplekseco:** Meza
**Kosto:** Neniu (nur tempo)

---

### Opcio 2: Android-Aplikaĵo (Capacitor/Cordova)
**Kial:** Pli bona integriĝo kun Android, aliro al pli da API-oj.

**Taskoj:**
1. **Agordi Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   npx cap add android
   ```

2. **Android-Specifaj Funkcioj**
   - Fona GPS-monitorado
   - Widget por hejmekrano
   - Sciigoj pri alteco-ŝanĝoj
   - Pli bona baterio-administrado

3. **Distribuo**
   - Google Play Store-publikigo
   - APK-generado por rekta instalo

**Tempo:** 3-4 semajnoj
**Komplekseco:** Alta
**Kosto:** $25 (Google Play Developer-konto)

---

### Opcio 3: iOS-Aplikaĵo (Capacitor)
**Kial:** Pli bona integriĝo kun iOS, sed bezonas Mac + Apple Developer-konton.

**Taskoj:**
1. **Agordi Capacitor por iOS**
   ```bash
   npx cap add ios
   ```

2. **iOS-Specifaj Funkcioj**
   - Core Location optimumigoj
   - Widget por hejmekrano
   - Apple Watch-subteno (estonte)

3. **Distribuo**
   - App Store-publikigo
   - TestFlight beta-testado

**Tempo:** 4-6 semajnoj
**Komplekseco:** Tre Alta
**Kosto:** $99/jare (Apple Developer Program)
**Bezonas:** Mac-komputilo + Xcode

---

## Rekomendo: PWA-Plibonigoj (Opcio 1)

### Kial PWA?
1. **Universala:** Funkcias sur iOS, Android, Desktop
2. **Neniu Aprobo:** Ne bezonas App Store/Play Store aprobon
3. **Tuja Ĝisdatigo:** Ĝisdatigoj estas tujaj, sen atendi aprobon
4. **Malalta Kosto:** Neniu jara pago
5. **Facila Distribuo:** Nur URL-ligilo

### Prioritataj Plibonigoj (Venontaj 2 Semajnoj)

#### Semajno 1: Datumoj kaj Historio
- [ ] Alteco-historio (lasta 24h, 7d, 30d)
- [ ] Simpla grafiko (canvas aŭ SVG)
- [ ] Eksporti datumojn
- [ ] Statistikoj-paĝo

#### Semajno 2: UX kaj Instaleblo
- [ ] "Instali" butono
- [ ] Ekrankopioj por manifest
- [ ] Haptic feedback
- [ ] Temo-elektilo
- [ ] Plibonigita offline-sperto

---

## Longtempa Vizio (3-6 Monatoj)

### Fazo 1: Datumoj kaj Analitiko (✓ Venonta)
- Historio kaj grafikoj
- Eksportado
- Statistikoj

### Fazo 2: Sociaj Funkcioj
- Dividi altecon (social media)
- Kompari kun amikoj
- Alteco-defioj

### Fazo 3: Avancitaj Funkcioj
- Topografia mapo-integriĝo
- Vojo-registrado (hiking trails)
- Vetero-integriĝo
- Komunuma alteco-datumbazo

### Fazo 4: Platformo-Specifaj Aplikaĵoj
- Android-aplikaĵo (se bezonata)
- iOS-aplikaĵo (se bezonata)

---

## Konkluzo

**Rekomendo:** Daŭrigu kun PWA kaj plibonigu ĝin antaŭ ol konsideri nativan aplikaĵon.

**Venonta Paŝo:** Komenci kun alteco-historio kaj datumoj-eksportado.

**Demando al Vi:** Ĉu vi volas:
1. Plibonigi PWA (rekomendita)
2. Krei Android-aplikaĵon
3. Krei iOS-aplikaĵon
4. Alia ideo?
