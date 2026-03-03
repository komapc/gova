# Plano por Gova Android-Aplikaĵo (Nativa)

Ĉi tiu dokumento priskribas la planon kaj nunan staton de la Android-aplikaĵo (APK/AAB) por Gova.

## Elektita Strategio: Nativa Aplikaĵo (Kotlin + Jetpack Compose)

Origine, la plano estis krei TWA (Trusted Web Activity) de la PWA. Tamen, la projekto evoluis al plene nativa aplikaĵo uzante Kotlin kaj Jetpack Compose (trovebla en la dosierujo `gova-android/`).

**Kial Nativa?**
- **Plibonigita Aliro al Aparataro:** La nativa apo havas rektan aliron al la aparatara barometro (`Sensor.TYPE_PRESSURE`), kio ebligas multe pli precizan kalkuladon de la alteco kompare kun la retumila API.
- **Preciza GPS:** Uzo de `FusedLocationProviderClient` provizas tre precizajn datumojn pri alteco kaj precizeco.
- **Uzanto-Sperto (UX):** Per Jetpack Compose, la apo plene rekreis la minimalisman dezajnon de la PWA sed kun nativaj kuraĝigoj, reagoj (ekz. haptika reago), kaj plibonigita rendimento.

### Nuna Stato de la Nativa Apo
1. **[FARITA]** Uzanto-interfaco (UI) per Jetpack Compose, kiu sekvas la minimalisman dezajnon de la PWA.
2. **[FARITA]** Integriĝo kun `FusedLocationProviderClient` por GPS-alteco.
3. **[FARITA]** Integriĝo kun aparatara barometro por barometra alteco.
4. **[FARITA]** Baza agordo de la projekto (build.gradle) kun pretaj subskribaj agordoj por eldono.
5. **[BEZONAS]** EGM96 (Geoid) korekton por preciza MSL (Meza Marnivelo) alteco de la GPS, ĉar nuntempe ĝi uzas la elipsoidan altecon de WGS84.

### Fazo 3: Testado kaj Konstruado
1. Konstrui la APK/AAB-dosieron: Loke ene de la `gova-android` dosierujo per `./gradlew assembleRelease` (certigu, ke `gova-release.keystore` ĉeestas en la radika dosierujo de la projekto).
2. Testi la `.apk` dosieron sur reala Android-aparato.

### Fazo 4: Publikigo al Google Play Store
1. Krei Google Play Developer konton ($25 unufoja pago).
2. Plenigi la Play Store detalojn (priskribo en Esperanto, ekrankopioj).
3. Alŝuti la kreitan `.aab` dosieron.
