/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#0d0e3d',
          100: '#1a1b57',
          200: '#2b2d72',
          300: '#383a94',
          400: '#4648d4',
          500: '#4648d4',
          600: '#4648d4',
          700: '#9294f5',
          800: '#c0c1ff',
          900: '#e1e0ff',
        },
        // Kept for any lingering `ink-900` reference — aliased to white now
        // that the app is dark-only (was the brand navy on a light theme).
        ink: {
          900: '#ffffff',
          800: '#ffffff',
          700: '#c6c6c6',
        },
        // Dark-theme surfaces/text, named to match the source design spec.
        background: '#000000',
        surface: '#0e0e0e',
        'surface-high': '#1b1b1b',
        'surface-highest': '#2d3133',
        'surface-border': '#2d3133',
        outline: '#848484',
        'on-surface': '#ffffff',
        'on-surface-variant': '#c6c6c6',
        // Legacy `gray-*` ramp — unused in new code, kept only so a missed
        // reference renders dark instead of crashing. Prefer the tokens above.
        gray: {
          50: '#0e0e0e',
          100: '#1b1b1b',
          200: '#2d3133',
          300: '#474747',
          400: '#848484',
          500: '#a8a8a8',
          600: '#c6c6c6',
          700: '#e5e5e5',
          800: '#f3f4f6',
          900: '#ffffff',
        },
      },
      fontFamily: {
        // Deliberately System, not a loaded Inter font file: React Native
        // requires a SEPARATE font file per weight for custom fonts (no
        // "fontWeight" synthesis the way CSS web has for variable fonts),
        // so forcing one Inter file as the global default would silently
        // flatten every font-semibold/font-bold heading across the app to
        // regular weight. System (San Francisco/Roboto) already renders
        // fontWeight correctly and reads visually close to Inter.
        sans: ['System'],
      },
      borderRadius: {
        DEFAULT: '2px',
        lg: '4px',
        xl: '8px',
      },
    },
  },
  plugins: [],
};
