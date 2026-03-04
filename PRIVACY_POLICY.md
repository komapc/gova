# Privateca Politiko de Gova

Laste ĝisdatigita: Marto 2026

Gova estas aplikaĵo por monitori altecon. Ĉi tiu dokumento klarigas kiel ni traktas viajn datumojn.

## 1. Kolekto de Datumoj
Gova kolektas la jenajn datumojn por sia kerna funkciado:
- **Preciza Loko (GPS):** Ni bezonas vian lokon por kalkuli vian altecon.
- **Sensilo-Datumoj (Barometro):** Ni uzas la aparataran barometron por mezuri aerpremon.

## 2. Uzo de Datumoj
Ĉiuj datumoj estas procesitaj **loke sur via aparato**. 
- Ni **ne** sendas viajn lok-datumojn al niaj serviloj.
- Ni **ne** konservas vian personan historion ekster via propra telefono.
- La sola fojo kiam la apo komunikas kun la reto estas por fari asinkronan serĉon de MSL-alteco (Geoid-korekto) ĉe la libera API `open-elevation.com`. Ĉi tiu peto estas anonima.

## 3. Kundivido kun Tria Partioj
Ni **ne** dividas, vendas aŭ malkaŝas viajn datumojn al iu ajn kompanio aŭ tria partio.

## 4. Viaj Permesoj
Vi povas iam ajn revoki permeson al la GPS-datumoj en viaj Android-agordoj. Tamen, la apo ne povos montri vian altecon sen ili.

## 5. Kontakto
Se vi havas demandojn, vi povas kontakti la programiston per la GitHub-paĝo de la projekto: https://github.com/komapc/gova
