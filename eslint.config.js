import globals from 'globals';

export default [
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        // Experimental browser APIs (Generic Sensor)
        Barometer: 'readonly',
        // Cross-file globals (loaded via <script> tags)
        Analytics: 'readonly',
        Chart: 'readonly',
        GPS: 'readonly',
        Storage: 'readonly',
        Units: 'readonly',
        I18n: 'readonly',
        Theme: 'readonly',
        Install: 'readonly',
        History: 'readonly',
        SavedPoints: 'readonly',
        Coords: 'readonly',
        Gestures: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      // IIFE top-level assignments (const Foo = (() => {...})()) are exported
      // to window implicitly — ESLint sees them as unused. Suppress with warn only.
      'no-unused-vars': ['warn', {
        vars: 'local',           // only warn on non-top-level unused vars
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '.*',  // ignore catch(e) {}
      }],
      'no-console': 'off',
    },
  },
];
