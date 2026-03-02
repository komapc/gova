/**
 * theme.js — Temo-administrado por Gova
 */

const Theme = (() => {
  const KEY = 'gova_theme';
  const THEMES = {
    AUTO: 'auto',
    LIGHT: 'light',
    DARK: 'dark'
  };

  /**
   * Akiras nunan temon.
   * @returns {'auto'|'light'|'dark'}
   */
  function get() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && Object.values(THEMES).includes(saved)) {
        return saved;
      }
    } catch {}
    return THEMES.AUTO;
  }

  /**
   * Agordas temon.
   * @param {'auto'|'light'|'dark'} theme
   */
  function set(theme) {
    if (!Object.values(THEMES).includes(theme)) {
      theme = THEMES.AUTO;
    }

    try {
      localStorage.setItem(KEY, theme);
    } catch {}

    apply(theme);
  }

  /**
   * Aplikas temon al dokumento.
   * @param {'auto'|'light'|'dark'} theme
   */
  function apply(theme) {
    const root = document.documentElement;

    if (theme === THEMES.LIGHT) {
      root.classList.remove('dark');
      root.classList.add('light');
    } else if (theme === THEMES.DARK) {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      // AUTO - uzi sisteman preferon
      root.classList.remove('light', 'dark');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    }
  }

  /**
   * Inicializas temon.
   */
  function init() {
    const theme = get();
    apply(theme);

    // Aŭskulti sistemajn ŝanĝojn
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (get() === THEMES.AUTO) {
        apply(THEMES.AUTO);
      }
    });
  }

  return {
    THEMES,
    get,
    set,
    apply,
    init
  };
})();
