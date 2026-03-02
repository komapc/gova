# Plano por Gova Android-Aplikaĵo (Native/TWA)

Ĉi tiu dokumento priskribas la planon por krei Android-aplikaĵon (APK/AAB) el la nuna Gova PWA.

## Ebloj por Android-Apo

Ni havas du ĉefajn eblojn por krei la Android-aplikaĵon:

### Eblo 1: TWA (Trusted Web Activity) per Bubblewrap / PWABuilder - **Rekomendita**
Ĉar Gova jam estas plene funkcianta kaj altkvalita PWA (kun manifest.json, Service Worker, kaj respondema dezajno), la plej facila kaj logika paŝo estas krei TWA. TWA permesas meti la PWA-on ene de Android-aplikaĵo (APK), kiun oni povas publikigi en Google Play Store. 

**Avantaĝoj:**
- Uzos la precize saman kodon kiel la retpaĝo (neniu bezono reverki kodon).
- Ĉiu ĝisdatigo al la retpaĝo aŭtomate ĝisdatigas la apon.
- Tre malgranda dosiergrando (apenaŭ kelkaj megabajtoj).
- Rapida disvolviĝo (povas esti farita en malpli ol unu horo).

### Eblo 2: Kapacitilo (Capacitor) / Cordova
Ĉi tio prenus viajn nunajn HTML/CSS/JS dosierojn kaj pakiĝus ilin ene de Android-aplikaĵo, kiu ruliĝas loke (ne tra reto krom se necese).

**Avantaĝoj:**
- Pli bona aliro al denaskaj (native) aparato-funkcioj (ekz. pli profunda aliro al GPS se la retumila API ne sufiĉas).
- Funkcias plene senrete sen dependi de Service Worker-konservado, ĉar la dosieroj estas en la telefono.
**Malavantaĝoj:**
- Pli kompleksa agordo.
- Vi devos mem publikigi ĝisdatigojn al la Play Store por ŝanĝi la kodon.

---

## Elektita Strategio: Eblo 1 (PWABuilder / TWA)

Surbaze de la simpleco de Gova, TWA estas la plej efika maniero procedi. Jen la detala plano:

### Fazo 1: Preparo de la PWA (Preskaŭ farita)
1. **[FARITA]** Plene funkcianta PWA kun `manifest.json`.
2. **[FARITA]** Altkvalitaj ikonoj (512x512, maskable icons).
3. **[FARITA]** Funkcianta Service Worker por senreta uzo.
4. **[BEZONAS KONTROLON]** Reta gastigado (La programo devas esti publike alirebla per HTTPS, ekz. per Vercel, GitHub Pages, aŭ propra servilo). Ni devas certigi la aktualan URL-on.

### Fazo 2: Generado de la Android Projekto
Ni uzos `@pwabuilder/pwabuilder` aŭ la retan ilon (pwabuilder.com) por generi la Android-kodon.
Se ni volas fari ĝin loke per komandlinio, ni uzos `bubblewrap`:

1. Instali Bubblewrap CLI: `npm i -g @GoogleChromeLabs/bubblewrap`
2. Ruli iniciaton per la URL de Gova: `bubblewrap init --manifest https://via-gova-domajno.com/manifest.json`
3. Sekvi la instrukciojn por agordi la aplikaĵon (Nomo, Koloroj, Versio).
4. Krei subskriban ŝlosilon (keystore) por povi publikigi ĝin.

### Fazo 3: Testado kaj Konstruado
1. Konstrui la APK/AAB-dosieron: `bubblewrap build`
2. Testi la `.apk` dosieron sur reala Android-aparato por certigi, ke:
   - La GPS-permesoj aperas ĝuste.
   - La plenekrana reĝimo funkcias sen retumilaj bretoj.
   - La gestoj (tuŝi, longpremi) funkcias normale.
   - Senreta reĝimo funkcias post la unua uzo.

### Fazo 4: Publikigo al Google Play Store (Nedeviga sed ebla)
1. Krei Google Play Developer konton ($25 unufoja pago).
2. Agordi Digital Asset Links: Ĉi tio ligas vian domajnon al la apo. Vi devas meti dosieron `assetlinks.json` en `.well-known/assetlinks.json` sur via retpaĝo por pruvi proprieton de la domajno kaj forigi la retumilan adresbreton ene de la apo.
3. Plenigi la Play Store detalojn (priskribo en Esperanto, ekrankopioj).
4. Alŝuti la kreitan `.aab` dosieron.

---

## Kion ni bezonas fari tuj?

Por komenci fari la Android-apon, bonvolu konfirmi:
1. Kio estas la publika URL kie Gova estas nuntempe gastigita (ekz. Vercel, Netlify, ktp.)? Ni bezonas ĉi tion por la TWA.
2. Ĉu vi volas krei la Android-projekton loke (mi povas ruli la `bubblewrap` komandojn se ni havas Node.js), aŭ ĉu vi preferas uzi retejon kiel pwabuilder.com?
