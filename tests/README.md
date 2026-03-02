# Gova — Testoj

## Kiel Ruli Testojn

### Retumila Testoj (REKOMENDITA)
Malfermu `tests/run-tests.html` en via retumilo por vidi interaktivajn test-rezultojn.

```bash
# Starigi lokan servilon
python3 -m http.server 8000
# Poste malfermu: http://localhost:8000/tests/run-tests.html
```

### Node.js Testoj
⚠️ **Noto**: La testoj estas dizajnitaj por retumila medio. Por Node.js-testoj, vi bezonus aldoni eksportajn deklaron al la moduloj.

Por nun, uzu la retumilan test-rulilon supre.

## Test-Kovrado

### Units Module (`js/units.js`)
- ✓ Konverto metroj → futoj
- ✓ Absoluta alteco-kalkulado
- ✓ Relativa alteco-kalkulado
- ✓ Formatado en metroj
- ✓ Formatado en futoj
- ✓ Prefiksoj por relativaj valoroj (+/-)
- ✓ Precizeco-formatado
- ✓ Null-valoro-traktado

### Storage Module (`js/storage.js`)
- ✓ Unuo-konservado (m/ft)
- ✓ Lasta alteco-konservado
- ✓ Precizeco-konservado
- ✓ Loknomo-konservado
- ✓ Baza alteco-konservado
- ✓ Baza alteco-forigado
- ✓ Nevalida datumoj-traktado

## Mankantaj Testoj

### GPS Module (`js/gps.js`)
GPS-testoj bezonas mock-objektojn por `navigator.geolocation` kaj `fetch` API.
Konsideru aldoni:
- Geolocation API mock
- Fetch API mock por Open-Elevation
- Timeout-traktado
- Error-traktado

### App Module (`js/app.js`)
App-testoj bezonas DOM-simuladon kaj event-traktadon.
Konsideru aldoni:
- DOM-interagoj
- Touch/click event-traktado
- Settings overlay-funkciado
- BroadcastChannel-sinkronigo

## Estontaj Plibonigoj
- Aldoni E2E-testojn per Playwright aŭ Cypress
- Aldoni test-kovradan raporton
- Aŭtomatigi testojn en CI/CD
- Aldoni performance-testojn
