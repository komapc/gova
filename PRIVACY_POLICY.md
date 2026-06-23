# Gova Privacy Policy

Last updated: June 2026

Gova is an altitude-monitoring app. This document explains how it handles your data. The short version: **Gova never stores your data — anywhere.**

## 1. Data We Access
For its core function, Gova accesses:
- **Precise location (GPS):** needed to calculate your altitude.
- **Sensor data (barometer):** used to measure air pressure.

## 2. We Never Store Your Data
All data is processed **locally on your device, in real time**.
- We have **no servers** — there is nowhere for your data to be stored.
- Gova keeps **no history or log** of your location or altitude, not even on your own device.
- We **never** store, sell, or share your personal data with anyone.
- The only thing saved on your device is a single on/off setting for the optional online-elevation feature (see below). No location or personal data is ever saved.

## 3. The One Network Request (optional, off by default)
Gova works fully offline. If — and only if — you turn on the optional **Online Terrain Elevation** feature (the **GROUND** reading), the app sends your **coordinates (latitude/longitude)** to the free public service `opentopodata.org` over an encrypted (HTTPS) connection to look up the ground elevation at your position.
- The request is **anonymous** — it contains no identifiers and no account.
- The coordinates are used for that single real-time lookup and are **not stored** by us.
- While the feature is off, **no data ever leaves your device.**

## 4. Third Parties
We do **not** share, sell, or disclose your data to any company or third party.

## 5. Your Permissions
You can revoke the GPS permission at any time in your Android settings. The app simply won't be able to show your altitude without it.

## 6. Contact
Questions? Reach the developer via the project's GitHub page: https://github.com/komapc/gova
