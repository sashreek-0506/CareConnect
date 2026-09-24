/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C2331',
          soft: '#2B3346',
        },
        paper: '#F3F4EF',
        panel: '#FFFFFF',
        line: '#DCDACF',
        slate: {
          DEFAULT: '#5B6472',
          light: '#8A93A0',
        },
        accent: {
          DEFAULT: '#E2A33C',
          deep: '#C8821F',
          soft: '#FBEBD0',
        },
        success: { DEFAULT: '#2F7A4D', soft: '#E1F0E5' },
        warning: { DEFAULT: '#C97A2B', soft: '#F7E6D3' },
        danger: { DEFAULT: '#C1443C', soft: '#F6DEDC' },
        info: { DEFAULT: '#2F6690', soft: '#DFEAF2' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '6px',
      },
    },
  },
  plugins: [],
};
