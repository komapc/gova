# Gova — Ŝanĝ-Protokolo

## [v3.13.0] - 2026-11-10

### 🔎 SEO kaj lingvoj
- **Lingvaj ĉef-paĝoj:** `/` nun estas angla (x-default; titolo "What Is My
  Altitude? Free GPS & Barometer Altimeter — Gova"), plus nova rusa `/ru/` kaj
  Esperanta `/eo/` (la antaŭa Esperanto-teksto). Ĉiu havas propran `lang`,
  titolon, priskribon, canonical, OG/Twitter, JSON-LD kaj reciprokajn
  `hreflang`-ligilojn; ankaŭ en `sitemap.xml`. La paĝoj estas generataj el
  `index.html` + `js/i18n.js` per `npm run build:lang`; `npm test` malsukcesas
  se ili malfreŝiĝas.
- **Rusa interfaco:** nova lingvo `ru` en `js/i18n.js` kaj butono RU.
- **Lingvo-elekto:** konservita elekto > lingvo de la paĝo (`/ru/`, `/eo/`) >
  retumila lingvo > angla (antaŭe: Esperanto). Klako sur lingvo-ligilo konservas
  la elekton.
- `history.html` kaj `points.html`: `noindex`, forigitaj el la sitemap.
- Service Worker: antaŭkaŝmemorigas `/ru/` kaj `/eo/`; kaŝmemoro → `gova-v3.24`.
- Play-listigo (`docs/play-assets/store-listing.md`): angla teksto ĝisdatigita,
  aldonita rusa versio.

## [v3.12.0] - 2026-11-10

### 🐞 Cim-Riparoj
- **Historio tenas 7 tagojn:** GPS-bruo igis preskaŭ ĉiun fikson "signifa",
  do la 1000-era limo tenis nur ~1-8 h kaj la 24h/7d-vidoj neniam pleniĝis.
  Nun, kiam la limo estas atingita, malnovaj eroj estas maldensigitaj (la
  plej novaj 300 en plena rezolucio, ĝis 24 h po 1 ero/5 min, pli malnovaj po
  1 ero/30 min) — 7 tagoj eniras la saman limon de 1000 eroj.
- **Service Worker:** malsukcesa antaŭkaŝmemorigo nun malsukcesigas la
  instalon (antaŭe la nova SW aktiviĝis kaj forigis la malnovan kaŝmemoron,
  rompante la ofline-reĝimon); dosieroj estas ŝargataj kun
  `{cache: 'reload'}`; riparita la ofline-retropaŝo al `index.html` (la
  `||` inter du promesoj neniam atingis la duan). Kaŝmemoro → `gova-v3.23`.
- **Konservi punkton:** ne plu uzas la konservitan altecon de antaŭa
  sesio/loko kun la nunaj koordinatoj — sen nuna fikso montriĝas la
  "neniu GPS" mesaĝo.
- **Konservitaj punktoj:** ĉe la limo de 20 la 21-a punkto estas rifuzita
  kun mesaĝo (antaŭe la plej malnova silente malaperis); defaŭltaj nomoj
  kaj ID-oj ne plu ripetiĝas.
- Konservita alteco de 0 m ne plu estas anstataŭigita per la kruda
  elipsoida GPS-alteco ĉe unu-ŝanĝo (`??` kaj MSL-retropaŝo).
- `checkDailyReset` ne plu ĵetas ĉe ĉiu GPS-fikso se localStorage estas
  blokita.

## [v3.11.0] - 2026-07-01

### 🔒 Sekureco
- **XSS-riparo:** konservitaj punkto-nomoj (redakteblaj de la uzanto) nun
  estas eskapitaj antaŭ enmeto per `innerHTML` en `points.html`.
- **Ter-alteca konsento:** la reta ter-serĉo (kiu sendas la lokon eksteren)
  nun estas **elektebla kaj defaŭlte malŝaltita** — kongrue kun la privateca
  politiko kaj la denaska app. Nova baskulilo en Agordoj → Privateco.
- **CSP:** aldonita `Content-Security-Policy` `<meta>` al ĉiuj paĝoj (por
  GitHub Pages, kiu ne povas agordi kap-liniojn); la enliniaj skriptoj de
  `points.html` kaj `about.html` estas eltiritaj al eksteraj dosieroj por ke
  `script-src` restu strikta. Riparita `connect-src` en `vercel.json`
  (`open-meteo.com` anstataŭ la malaktuala `opentopodata`, kiu blokis la
  ter-serĉon ĉe Vercel).

### 🐞 Cim-Riparoj
- `??` anstataŭ `||` por ke valida legaĵo de 0 m ne perdiĝu; eblas nun agordi
  bazan altecon ĉe ekzakte 0 m; History/Storage nun registras la SAMAN
  altecon kiun montras la ĉefnumero.
- **Android barometra kalibrado:** nova `BaroCalibrator` ankras P0 al la
  geoide-korektita MSL-alteco (re-ankras ĉiun 5 min) anstataŭ la fiksa
  1013.25 hPa (±100 m eraro) — sama logiko kiel la reta `gps.js`.

### ✨ Plibonigoj
- **Alireblo:** `aria-live` sur la altec-montriloj por ke ekranlegiloj
  anoncu ŝanĝojn.
- **ITM-etikedo:** korektita al "ITM" (ICS neniam estis realigita);
  dokumentita ke la projekcio preterlasas la WGS84→Israel-1993 datum-ŝovon.
- **PWA-ekrankopioj:** `manifest.json` `screenshots[]` plenigita por pli
  riĉa instal-invito.
- Privateca politiko reskribita por precizeco (surloka konservado, open-meteo,
  elektebla analizo).

### 📦 Pakaĵoj kaj Ilaro
- Reto: ESLint `9→10`, globals `15→17`.
- Android: Kotlin `1.9.0→1.9.25`, Compose-kompililo `1.5.1→1.5.15`, Compose
  BOM `2023.08→2024.06`, core-ktx `1.13.1`, lifecycle `2.8.7`,
  activity-compose `1.9.3`, play-services-location `21.3.0`; `Divider` →
  `HorizontalDivider`.
- CI: GitHub-agoj ĝisdatigitaj al node24-aj ĉefversioj (forigita la node20
  malrekomend-averto); `npm install` → `npm ci`, Node 18→20.
- Service Worker ĝisdatigita al `gova-v3.18`.

## [v3.7.0] - 2026-06-02

### 🐞 Cim-Riparoj
- **ITM-koordinatoj korektitaj:** la norda koordinato (northing) estis
  malĝusta je ~3,5 milionoj da metroj pro erara falsa-norda parametro
  (`-2885516.9488` → `626907.39`, EPSG:2039). La orienta koordinato jam
  estis ĝusta. Nun la natura origino mapas ekzakte al (219529.584,
  626907.39), kaj israelaj urboj donas realmondajn ITM-valorojn.

### ✨ Plibonigoj
- **Barometra aŭto-kalibrado:** la barometro nun kalibriĝas kontraŭ la
  ter-MSL de opentopodata anstataŭ uzi fiksan 1013.25 hPa (kio povis erari
  je ±100m). La barometro regas la montron nur kiam ĝi havas validan
  absolutan ankron; re-ankras ĉiun 5 min kontraŭ veter-drivo.
- **Vera ofline-ter-alteco:** la alteco-kaŝmemoro nun persistas en
  `localStorage` (antaŭe nur en RAM, perdita ĉe reŝargo) kaj estas
  konsultata ANTAŬ la ofline-gardilo, do la PWA montras ter-altecon ofline.

### 🔧 Teknikaj Plibonigoj
- **Nova modulo `js/gestures.js`:** la tuŝ-/musa stat-maŝino estas eltirita
  el `app.js` (~120 linioj malpli) malantaŭ semantika revoko-API.
- **Forigita morta kodo:** nuzataj `Storage.*LastLocation`-funkcioj kaj la
  Nominatim reto-nur-ŝablono (neniam uzataj).
- **Riparitaj komentoj:** korektitaj eraraj "Open-Elevation"-referencoj
  (estas opentopodata) kaj cirilaj literoj en `sw.js`.
- Service Worker ĝisdatigita al `gova-v3.7`.

### 🧪 Testoj
- `tests/coords.test.js` — 7 testoj por la ITM-konvertado (ankras sur la
  origin→(E0,N0)-invarianto + realmondaj urboj).
- `tests/gps.test.js` — 6 testoj por la puraj barometraj funkcioj.

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
