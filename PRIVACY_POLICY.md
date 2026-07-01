# Gova Privacy Policy

Last updated: July 2026

Gova is an altitude-monitoring app. This document explains how it handles your data. The short version: **Gova runs entirely on your device. It has no servers and no accounts, and nothing leaves your device unless you explicitly turn on an optional feature.**

## 1. Data We Access
For its core function, Gova accesses:
- **Precise location (GPS):** needed to calculate your altitude.
- **Sensor data (barometer):** used to measure air pressure (on devices that have one).

## 2. On-Device Storage
So the app can work offline and remember your readings, Gova saves some data **locally on your own device** (in your browser's storage on the web, or app storage on Android). This includes:
- your **altitude history** (up to ~1000 recent readings) and the **points you save**;
- today's highest/lowest reading and your optional **base altitude**;
- your **preferences** (units, theme, language, coordinate display) and the on/off consent toggles for the optional features below.

This data **stays on your device**. We have **no servers**, so it is never uploaded to us, and we never sell or share it. You can erase all of it at any time by clearing the site's data (web) or uninstalling the app (Android). *(The Android app stores less than the website — it keeps only your settings and base altitude, and no altitude history.)*

## 3. Optional: Online Terrain Elevation (GROUND) — off by default
Gova works fully offline. If — and only if — you turn on the optional **Online Terrain Elevation** feature (the **GROUND** reading), the app sends your **coordinates (latitude/longitude)** over an encrypted (HTTPS) connection to a free public elevation service to look up the ground elevation at your position:
- on the **web** app, the service is **`open-meteo.com`**;
- in the **Android** app, the service is **`opentopodata.org`**.

The request is **anonymous** — it contains no identifiers and no account, is used only for that single real-time lookup, and is **not stored by us**. This feature is **off by default**; while it is off, **no location data ever leaves your device.**

## 4. Optional: Anonymous Analytics (web only) — off by default
The website can load **Google Analytics**, but **only if you opt in** in Settings — and never when your browser sends a Do-Not-Track signal. When enabled, it loads Google's `gtag` script and sends anonymous usage statistics to Google. It is **off by default**, and the Android app contains no analytics at all.

## 5. Third Parties
We do **not** sell or disclose your data. The only third parties that ever receive anything are the **elevation service** (Section 3) and **Google Analytics** (Section 4) — and only when *you* have explicitly enabled those optional features.

## 6. Your Permissions
You can revoke the GPS permission at any time in your browser or Android settings. The app simply won't be able to show your altitude without it.

## 7. Contact
Questions? Reach the developer via the project's GitHub page: https://github.com/komapc/gova
