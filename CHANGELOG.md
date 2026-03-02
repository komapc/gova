# Gova — Ŝanĝ-Protokolo

## [v3.0.0] - 2026-03-02

### ✨ Novaj Funkcioj

#### Alteco-Historio
- Aŭtomata registrado de ĉiu GPS-legado
- Vidu historion por 24h, 7d, 30d, aŭ ĉiuj datumoj
- Statistikoj: minimuma, maksimuma, averaĝa, amplekso
- Vizuala grafiko per Canvas API
- Maksimume 1000 registroj (aŭtomate forigas plej malnovajn)
- Nova paĝo: `history.html`

#### Datumoj-Eksportado
- Eksporti historion kiel JSON
- Eksporti historion kiel CSV
- Forigi ĉiujn historio-datumojn
- Elŝutaj dosieroj kun timestamp, koordinatoj, kaj precizeco

#### Temo-Elektilo
- Tri temoj: Aŭtomata, Hela, Malhela
- Aŭtomata sekvas sisteman preferon
- Persistas inter sesioj
- Tuja apliko sen paĝo-reŝarĝo
- CSS-variabloj por dinamikaj koloroj

#### PWA-Instalo
- Instalo-butono en agordoj
- Aŭtomata detekto de instaleblo
- iOS-instrukcioj por mana instalo
- Kaŝiĝas post sukcesa instalo
- beforeinstallprompt kaj appinstalled event-traktado

### 🔧 Teknikaj Plibonigoj

#### Novaj Moduloj
- `js/history.js` - Historio-administrado
- `js/chart.js` - Canvas-bazita grafiko-desegnilo
- `js/theme.js` - Temo-administrado
- `js/install.js` - PWA-instalo-administrado
- `js/history-page.js` - Historio-paĝa logiko

#### Service Worker
- Ĝisdatigita al v3
- Aldonitaj ĉiuj novaj dosieroj al kaŝmemoro
- Plibonigita kaŝmemor-strategio
- Aŭtomata malantaŭa ĝisdatigo

#### CSS
- Nova `css/history.css` por historio-paĝo
- CSS-variabloj por temoj
- Plibonigita respondeca dezajno
- Transicioj por glata temo-ŝanĝo

### 📝 Dokumentado

#### Novaj Dokumentoj
- `PWA_IMPROVEMENTS.md` - Detala priskribo de plibonigoj
- `RESUMO_PWA.md` - Esperanta resumo
- `CHANGELOG.md` - Ĉi tiu dosiero
- `tests/README.md` - Test-dokumentado
- `tests/run-tests.html` - Interaktiva test-rulilo

#### Ĝisdatigitaj Dokumentoj
- `TESTING_GUIDE.md` - Aldonitaj aŭtomataj testoj
- `NEXT_STAGE_PLAN.md` - Plano por venontaj etapoj
- `manifest.json` - Aldonitaj ekrankopioj

### 🧪 Testoj

#### Novaj Testoj
- `tests/units.test.js` - 13 testoj por Units-modulo
- `tests/storage.test.js` - 14 testoj por Storage-modulo
- `tests/run-tests.html` - Retumila test-rulilo
- `.github/workflows/test.yml` - GitHub Actions CI

#### Test-Kovrado
- Units-modulo: 100%
- Storage-modulo: 100%
- Totala: 27 testoj

### 📊 Statistikoj

- **Novaj Dosieroj**: 15
- **Ĝisdatigitaj Dosieroj**: 8
- **Novaj Linioj de Kodo**: ~1700
- **Novaj Funkcioj**: 4 ĉefaj
- **Novaj Testoj**: 27

---

## [v2.0.0] - 2026-03-01

### ✨ Novaj Funkcioj
- Minimuma UI-redesajno
- Relativa alteco-mezurado (baza alteco)
- Metroj/Futoj konverto
- Tuŝ-bazita interfaco (tap/long-press)
- Settings-folio
- Toast-sciigoj

### 🔧 Teknikaj Plibonigoj
- MSL-korekcio per Open-Elevation API
- localStorage por datumoj-persistado
- Service Worker por offline-subteno
- BroadcastChannel por unuo-sinkronigo

---

## [v1.0.0] - 2026-02-28

### ✨ Komenca Eldono
- GPS-bazita alteco-monitorado
- Bazaj agordoj
- PWA-subteno
- Offline-funkciado

---

## Venontaj Versioj

### [v3.1.0] - Planita
- Pli bonaj grafikoj (zoom, pan)
- Pli da statistikoj
- Filtrado kaj serĉado
- Notoj kaj etikedoj

### [v4.0.0] - Planita
- Sociaj funkcioj (dividi, kompari)
- Topografia mapo-integriĝo
- Vojo-registrado
- Vetero-integriĝo

Vidu `NEXT_STAGE_PLAN.md` por pli detalaj planoj.
