# Gova - Uzanto-Gvidilo

## Kio estas Gova?

Gova estas ultra-simpla aplikaĵo por montri vian altecon super marnivelo. Ĝi uzas la GPS de via aparato por akiri vian pozicion kaj montras nur la plej gravan informon: vian altecon.

## Kiel Uzi

### Ĉefa Ekrano

Kiam vi malfermas Gova, vi vidas nur unu grandan nombron — vian altecon:

```
        1234 m
```

Tio estas ĉio! Neniuj butonoj, neniuj menuoj, nur via alteco.

### Refreŝi GPS-Pozicion

**Tuŝu aŭ klaku ie ajn sur la ekrano** por mane refreŝi vian GPS-pozicion.

- La nombro momente ŝanĝos koloron (blua)
- Post momento, via nova alteco aperos
- Vi ne povas refreŝi pli ofte ol ĉiuj 2 sekundoj

### Malfermi Agordojn

**Premu kaj tenu** (pli ol duona sekundo) por malfermi la agordojn-menuon.

- Sur tuŝekranoj: tuŝu kaj tenu
- Sur komputilo: klaku kaj tenu
- Vi sentos vibron (se via aparato subtenas tion)
- Menuo glitos supren de malsupre

### Fermi Agordojn

- Tuŝu la "Fermi" butonon
- Tuŝu ekster la menuo
- Premu la Escape-klavon

## Agordoj

### Unuo-Elekto

Elektu inter:
- **Metroj** (m) - defaŭlta
- **Futoj** (ft)

Via elekto estas konservita kaj memoriĝas post reŝargo.

### Baza Alteco

Ĉi tiu funkcio permesas al vi mezuri **relativan** altecon — kiom vi supreniris aŭ malsupreniris kompare al komenca punkto.

#### Agordi Bazan Altecon

1. Iru al loko kie vi volas komenci mezuri
2. Malfermu agordojn (longpremo)
3. Tuŝu "Agordi Nunan kiel Bazon"
4. Nun la ekrano montros relativan altecon

**Ekzemplo:**
- Vi estas je 1000m
- Vi agordas tion kiel bazon
- Vi supreniras al 1050m
- La ekrano montras: **+50 m**
- Vi malsupreniras al 980m
- La ekrano montras: **-20 m**

#### Kiam Uzi Bazan Altecon?

- **Grimpado**: Mezuri kiom vi supreniris
- **Migrado**: Vidi elevacion-gajnon
- **Konstruaĵoj**: Kalkuli etaĝojn (ĉirkaŭ 3-4m po etaĝo)
- **Skio**: Mezuri malsupreniron

#### Forigi Bazan Altecon

1. Malfermu agordojn
2. Tuŝu "Forigi Bazon"
3. La ekrano revenas al absoluta alteco

### GPS-Stato

En la agordoj-menuo, vi vidas:
- **Stato**: Serĉas GPS... / GPS ŝlosita / GPS-eraro
- **Precizeco**: Kiom preciza estas la mezuro (ekz. ±5 m)

## Vidaj Indikiloj

### Stato-Punkto (supre-dekstre)

Malgranda punkto en la supra dekstra angulo montras GPS-staton:

- 🟡 **Flava (pulsanta)**: Serĉas GPS-signalon
- 🟢 **Verda**: GPS ŝlosita, bonaj datumoj
- 🔴 **Ruĝa**: Eraro okazis

### Delta-Simbolo (malsupre-maldekstre)

Kiam vi agordas bazan altecon, malgranda **Δ** (delta) aperas en la malsupra maldekstra angulo. Ĉi tio memorigas vin ke vi vidas relativan altecon, ne absolutan.

## Klavaro-Fulmklavoj

Se vi uzas komputilon:

- **Spaceto**: Refreŝi GPS
- **s**: Malfermi agordojn
- **Escape**: Fermi agordojn

## Sciigoj

Gova montras mallongajn sciigojn (toastojn) por gravaj eventoj:

- "Baza alteco agordita"
- "Baza alteco forigita"
- "Neniu GPS-datumo disponebla"
- GPS-eraroj kaj permesaj problemoj

Sciigoj aŭtomate malaperas post 3 sekundoj.

## Oftaj Demandoj

### Kial la nombro estas "—"?

La aplikaĵo ankoraŭ serĉas GPS-signalon. Atendu kelkajn sekundojn. Se ĝi daŭras:
- Kontrolu ke vi permesis GPS-aliron
- Iru eksteren (GPS ne funkcias bone endome)
- Kontrolu ke via aparato havas GPS

### Kial la alteco ne estas preciza?

GPS-alteco havas naturan neprecizecon de ±3-15 metroj. Faktoroj:
- Signalkvalito
- Nombro de satelitoj
- Medio (arboj, konstruaĵoj)
- Aparato-kvalito

Gova provas korekti ĉi tiun per MSL (marnivela) korekcio kiam vi estas rete.

### Kio estas MSL-korekcio?

GPS mezuras altecon relative al matematika modelo de la Tero (WGS84 elipsoido), ne la vera marnivelo. La diferenco povas esti ĝis ±100 metroj!

Kiam vi estas rete, Gova uzas Open-Elevation API por akiri la veran marnivelan altecon.

### Ĉu Gova funkcias senrete?

Jes! Post la unua vizito:
- La aplikaĵo estas kaŝmemorita
- GPS funkcias senrete
- Via lasta konata alteco estas konservita
- Agordoj funkcias senrete
- MSL-korekcio ne disponeblas (uzas GPS-altecon)

### Ĉu miaj datumoj estas privataj?

Jes, tute! 
- GPS-koordinatoj restas sur via aparato
- Neniaj datumoj estas senditaj al ni
- Nur du eksteraj servoj estas uzataj (nur kiam rete):
  - **Open-Elevation**: por MSL-korekcio
  - Ambaŭ ricevas nur koordinatojn, ne identigan informon

### Kiel instali kiel aplikaĵon?

Gova estas Progresema Ret-Aplikaĵo (PWA):

**iOS Safari:**
1. Tuŝu la "Kunhavigi" butonon
2. Elektu "Aldoni al Hejmekrano"
3. Konfirmu

**Chrome Android:**
1. Tuŝu la menuon (tri punktoj)
2. Elektu "Instali aplikaĵon" aŭ "Aldoni al hejmekrano"
3. Konfirmu

Post instalo, Gova malfermiĝos kiel sendependa aplikaĵo sen retumila interfaco.

### Kiel ĝisdatigi la aplikaĵon?

Gova aŭtomate ĝisdatiĝas:
- Service Worker kontrolas ĝisdatigojn
- Novaj versioj estas elŝutitaj en la fono
- Reŝargu la paĝon por uzi la novan version
- Viaj agordoj kaj datumoj estas konservitaj

## Konsiloj kaj Trikoj

### Mezuri Etaĝojn

1. Iru al la teretaĝo
2. Agordu bazan altecon
3. Iru al alia etaĝo
4. Dividu la montrita nombron per 3-4 (tipaj metroj po etaĝo)

**Ekzemplo:** +12m ≈ 3-4 etaĝoj supren

### Mezuri Montaran Supreniron

1. Komence de migrado: agordu bazan altecon
2. Dum migrado: vidu akumulitan elevacion-gajnon
3. Fino: vidu totalan supreniron

### Rapida Refreŝo

Se vi volas rapide ĝisdatigi:
- Tuŝu la ekranon
- Atendu 2 sekundojn
- Tuŝu denove

### Ŝpari Baterion

GPS uzas multe da baterio. Por ŝpari:
- Fermu la aplikaĵon kiam ne uzata
- Uzu malpli oftajn refreŝojn
- La aplikaĵo aŭtomate paŭzas kiam kaŝita

## Limigoj

- **GPS-precizeco**: ±3-15m estas normala
- **Endoma uzo**: GPS ne funkcias bone endome
- **Bateria uzo**: GPS konsumas baterion
- **MSL-korekcio**: Bezonas interretan konekton
- **Refreŝa frekvenco**: Maksimume ĉiuj 2 sekundoj

## Subteno

Gova funkcias sur:
- iOS Safari 14+
- Chrome Android 90+
- Modernaj labortablaj retumiloj
- Aparatoj kun GPS

## Versio

Nuna versio: **2.0** (Minimuma UI)

Ŝanĝoj de v1:
- ✨ Ultra-minimuma interfaco
- 👆 Tuŝu por refreŝi
- ⏱️ Longpremu por agordoj
- 📏 Nova baza-alteco funkcio
- 🎨 Pli bela, pli simpla

## Helpo

Se vi havas problemojn:
1. Reŝargu la paĝon
2. Kontrolu GPS-permesojn
3. Iru eksteren por pli bona signalo
4. Kontrolu ke via aparato havas GPS
5. Provu alian retumilon

---

**Ĝuu vian altecon! 🏔️**
