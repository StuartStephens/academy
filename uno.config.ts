import { defineConfig, presetUno, presetTypography } from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetTypography()],
  theme: {
    colors: {
      ink: {
        50: '#f8f8f6',
        100: '#ecece7',
        300: '#b8b7ad',
        500: '#6f6d64',
        700: '#3f3e38',
        900: '#1f1e1b',
      },
      paper: '#fcfcf9',
      accent: '#21557a',
      accentSoft: '#d8eaf6',
      success: '#2f6a4f',
      warning: '#8a5c1f',
    },
    fontFamily: {
      sans: '"Source Sans 3", "Segoe UI", sans-serif',
      display: '"Fraunces", Georgia, serif',
      mono: '"IBM Plex Mono", "Courier New", monospace',
    },
  },
});
