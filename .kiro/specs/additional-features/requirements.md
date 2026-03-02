# Aldonaj Funkcioj por Gova v3.1

## Superrigardo

Aldoni tri novajn funkciojn por plibonigi la uzanto-sperton:
1. Pull-to-refresh (swipe down) por refreŝi GPS-datumojn
2. Saved Points kun aŭtomata plej alta/malalta detekto
3. Versio-montrado en la aplikaĵo

## Uzanto-Rakontoj

### 1. Pull-to-Refresh

**Kiel** uzanto de Gova  
**Mi volas** povi swipe down sur la ĉefa ekrano  
**Por ke** mi povu rapide refreŝi la GPS-datumojn sen atendi la aŭtomatan ĝisdatigon

**Akceptaj Kriterioj:**
- [ ] 1.1 Uzanto povas swipe down sur la ĉefa ekrano
- [ ] 1.2 Vizuala indikilo aperas dum la swipe-gesto (rotacia ikono)
- [ ] 1.3 GPS-datumoj refreŝiĝas post sukcesa swipe
- [ ] 1.4 Ŝarĝ-animacio montriĝas dum refreŝado
- [ ] 1.5 Funkcias sur ambaŭ tuŝ-ekranoj kaj labortabloj
- [ ] 1.6 Ne konfliktas kun la ekzistanta tap/long-press funkcieco
- [ ] 1.7 Minimuma swipe-distanco: 80px
- [ ] 1.8 Debounce por eviti tro oftajn refreŝojn

### 2. Saved Points kun Aŭtomata Detekto

**Kiel** uzanto de Gova  
**Mi volas** vidi la plej altajn/malaltajn punktojn de la tago kaj konservi gravajn lokojn  
**Por ke** mi povu analizi miajn alteco-ŝanĝojn kaj uzi ilin kiel bazojn

**Akceptaj Kriterioj:**

#### 2.1 Aŭtomata Detekto
- [ ] 2.1.1 Sistemo aŭtomate detektas hodiaŭan plej altan punkton
- [ ] 2.1.2 Sistemo aŭtomate detektas hodiaŭan plej malalta punkton
- [ ] 2.1.3 Punktoj ĝisdatiĝas realtempe dum la tago
- [ ] 2.1.4 Punktoj resetas je noktomezo (00:00)

#### 2.2 Mana Konservado
- [ ] 2.2.1 "Konservi Nunan Punkton" butono en agordoj
- [ ] 2.2.2 Konservita punkto enhavas:
  - Alteco (metroj)
  - Koordinatoj (lat/lon)
  - Timestamp
  - Aŭtomata nomo (aŭ redaktebla)
- [ ] 2.2.3 Maksimume 20 manuale konservitaj punktoj

#### 2.3 Punktoj-Administrado
- [ ] 2.3.1 Sekcio en agordoj montras:
  - ⬆️ Hodiaŭa plej alta punkto
  - ⬇️ Hodiaŭa plej malalta punkto
  - 📍 Konservitaj punktoj (nombro)
- [ ] 2.3.2 "Vidi Ĉiujn Punktojn" butono malfermas liston
- [ ] 2.3.3 Por ĉiu punkto, uzanto povas:
  - Uzi kiel bazan altecon
  - Montri en grafiko (historio-paĝo)
  - Forigi (nur manuale konservitajn)
- [ ] 2.3.4 Punktoj persistas en localStorage

#### 2.4 Integriĝo kun Historio
- [ ] 2.4.1 Historio-paĝo montras markitajn punktojn sur grafiko
- [ ] 2.4.2 Plej alta/malalta punktoj estas videblaj en grafiko
- [ ] 2.4.3 Klakante punkton sur grafiko montras detalojn

### 3. Versio-Montrado

**Kiel** uzanto de Gova  
**Mi volas** vidi la version de la aplikaĵo  
**Por ke** mi sciu ĉu mi uzas la plej novan version

**Akceptaj Kriterioj:**
- [ ] 3.1 Versio-numero montriĝas en la piedo de agordoj-folio
- [ ] 3.2 Formato: "v3.1.0"
- [ ] 3.3 Versio estas facile legebla sed ne distras
- [ ] 3.4 Versio-numero estas sinkronigita kun manifest.json
- [ ] 3.5 Montras ankaŭ la build-daton (opciale)
- [ ] 3.6 Subtila stilo (malgranda teksto, malhela koloro)

## Teknikaj Konsideroj

### Pull-to-Refresh
- Uzi Touch Events API (touchstart, touchmove, touchend)
- Minimuma swipe-distanco: 80px
- Maksimuma swipe-distanco: 150px (por aktivigi)
- Vizuala feedback: rotacia ikono kun progreso
- Debounce: 2 sekundoj inter refreŝoj
- Ne aktiviĝas se agordoj-folio estas malfermita

### Saved Points
- Nova modulo: `js/saved-points.js`
- localStorage-ŝlosiloj:
  - `gova_saved_points` - manuale konservitaj
  - `gova_today_high` - hodiaŭa plej alta
  - `gova_today_low` - hodiaŭa plej malalta
  - `gova_last_reset_date` - lasta reset-dato
- Strukturo: `{ id, name, altitude, latitude, longitude, timestamp, type }`
- Tipo: 'manual', 'high', 'low'
- Integriĝo kun ekzistanta History-modulo

### Versio
- Difini VERSION konstanton: `const VERSION = '3.1.0'`
- Montri en `<div class="version-info">v3.1.0</div>`
- CSS: malgranda, malhela, malsupre de agordoj

## Prioritato

1. **Alta**: Versio-montrado (5 minutoj)
2. **Alta**: Pull-to-refresh (30 minutoj)
3. **Meza**: Saved Points (1-2 horoj)

## Dependecoj

- Neniu eksteraj dependecoj
- Uzas ekzistantajn modulojn (Storage, GPS, Units, History)
- Kongruas kun ekzistanta UI-dezajno

## Riskoj

- Pull-to-refresh povus konflikti kun ekzistantaj tuŝ-gestoj (solvita per stato-kontrolo)
- Saved Points bezonas bone dezajnitan UI (simpla listo kun akcioj)
- localStorage-limigoj (20 punktoj devus esti sufiĉe)

## Sukceso-Mezuroj

- ✅ Uzantoj povas refreŝi GPS-datumojn per swipe
- ✅ Uzantoj vidas hodiaŭajn plej altajn/malaltajn punktojn
- ✅ Uzantoj povas konservi kaj administri gravajn lokojn
- ✅ Uzantoj povas vidi la aplikaĵ-version
- ✅ Neniu regreso en ekzistanta funkcieco
