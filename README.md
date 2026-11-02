# Gova

**Live:** [gova.lipu.dev](https://gova.lipu.dev/)

Gova is a minimal altimeter in Esperanto: open it and it shows one big number —
your altitude above sea level. It combines GPS, the MSL geoid, the barometer and
SRTM elevation data, and works offline as a PWA (an Android wrapper lives in
`gova-android/`).

*Gova estas ultra-simpla alteco-monitorilo en Esperanto.* —
[Uzanto-gvidilo](UZANTO_GVIDILO.md)

## Development

```bash
npm install
npm test
```

See [CHANGELOG.md](CHANGELOG.md) for release history and
[PRIVACY_POLICY.md](PRIVACY_POLICY.md) for the privacy policy.

## License

Gova is released under the [MIT License](LICENSE).

The bundled geoid grid is resampled from the NGA EGM96 model via
[egm96-universal](https://github.com/nicolas-van/egm96-universal)
(MIT License, Copyright (c) 2020 Nicolas Vanhoren).

More projects: [lipu.dev](https://lipu.dev/)
