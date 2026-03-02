# Gova — Testoj kaj Venonta Etapo

## ✅ Kio Estas Farita

### 1. Testoj Aldonitaj

Kreitaj aŭtomataj testoj por la kernaj moduloj:

**Units Module (`js/units.js`):**
- Konverto metroj → futoj
- Absoluta kaj relativa alteco-kalkulado
- Formatado en ambaŭ unuoj
- Prefiksoj (+/-) por relativaj valoroj
- Precizeco-formatado
- Null-valoro-traktado

**Storage Module (`js/storage.js`):**
- Unuo-konservado (m/ft)
- Alteco kaj precizeco-konservado
- Baza alteco-administrado
- Nevalida datumoj-traktado

### 2. Test-Dosieroj

```
tests/
├── units.test.js        # Testoj por Units-modulo
├── storage.test.js      # Testoj por Storage-modulo
├── run-tests.html       # Retumila test-rulilo
└── README.md            # Test-dokumentado
```

### 3. Kiel Ruli Testojn

**En Retumilo (Rekomendita):**
Malfermu `tests/run-tests.html` en via retumilo.

**En Node.js:**
```bash
npm test              # Ĉiuj testoj
npm run test:units    # Nur Units-testoj
npm run test:storage  # Nur Storage-testoj
```

### 4. Ĝisdatigita Dokumentado

- `TESTING_GUIDE.md` — Aldonitaj informoj pri aŭtomataj testoj
- `tests/README.md` — Detala test-dokumentado
- `package.json` — Aldonitaj test-skriptoj

---

## 🚀 Plano por Venonta Etapo

### Rekomendo: Plibonigi PWA

Gova jam estas funkcianta PWA. Antaŭ ol krei nativan aplikaĵon, ni devus plibonigi la PWA-sperton.

### Kial PWA?

✅ **Universala** — Funkcias sur iOS, Android, Desktop  
✅ **Neniu Aprobo** — Ne bezonas App Store/Play Store  
✅ **Tuja Ĝisdatigo** — Ĝisdatigoj estas tujaj  
✅ **Malalta Kosto** — Neniu jara pago  
✅ **Facila Distribuo** — Nur URL-ligilo  

### Prioritataj Plibonigoj (Venontaj 2 Semajnoj)

#### Semajno 1: Datumoj kaj Historio
- [ ] Alteco-historio (lasta 24h, 7d, 30d)
- [ ] Simpla grafiko (canvas aŭ SVG)
- [ ] Eksporti datumojn (JSON/CSV)
- [ ] Statistikoj (maksimuma/minimuma alteco)

#### Semajno 2: UX kaj Instaleblo
- [ ] "Instali" butono en agordoj
- [ ] Ekrankopioj por manifest.json
- [ ] Haptic feedback plibonigoj
- [ ] Temo-elektilo (malhela/hela)
- [ ] Plibonigita offline-sperto

### Alternativaj Opcioj

**Android-Aplikaĵo (Capacitor):**
- Tempo: 3-4 semajnoj
- Kosto: $25 (Google Play Developer)
- Komplekseco: Alta

**iOS-Aplikaĵo (Capacitor):**
- Tempo: 4-6 semajnoj
- Kosto: $99/jare (Apple Developer)
- Bezonas: Mac + Xcode
- Komplekseco: Tre Alta

### Longtempa Vizio (3-6 Monatoj)

**Fazo 1: Datumoj kaj Analitiko** (✓ Venonta)
- Historio kaj grafikoj
- Eksportado
- Statistikoj

**Fazo 2: Sociaj Funkcioj**
- Dividi altecon
- Kompari kun amikoj
- Alteco-defioj

**Fazo 3: Avancitaj Funkcioj**
- Topografia mapo
- Vojo-registrado
- Vetero-integriĝo

**Fazo 4: Nativaj Aplikaĵoj**
- Android (se bezonata)
- iOS (se bezonata)

---

## 📊 Nuna Stato

### Funkcioj ✅
- GPS-bazita alteco-monitorado
- MSL (marnivelo) korekcio
- Relativa alteco-mezurado
- Metroj/Futoj konverto
- Minimuma, tuŝ-bazita UI
- Offline-subteno
- Aŭtomataj testoj

### Mankantaj Funkcioj
- Alteco-historio
- Datumoj-eksportado
- Grafikoj
- Instali-butono
- Temo-elektilo
- Lingvo-elektilo

---

## 🎯 Rekomendo

**Daŭrigu kun PWA** kaj plibonigu ĝin antaŭ ol konsideri nativan aplikaĵon.

**Venonta Paŝo:** Komenci kun alteco-historio kaj datumoj-eksportado.

Vidu `NEXT_STAGE_PLAN.md` por pli detalaj informoj.
