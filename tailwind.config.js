/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Use class-based dark mode so NativeWind's web runtime can control the color
  // scheme without throwing ("Cannot manually set color scheme … type 'media'").
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark, minimal palette
        bg: {
          DEFAULT: '#0B0F14',
          elevated: '#121821',
          card: '#161D27',
          input: '#1C2530',
        },
        border: {
          DEFAULT: '#243040',
          subtle: '#1A2230',
        },
        text: {
          DEFAULT: '#E7ECF2',
          muted: '#9AA7B6',
          faint: '#5E6B7A',
        },
        accent: {
          DEFAULT: '#22D3EE',
          dim: '#0E7490',
        },
        recovery: {
          high: '#34D399',
          mid: '#FBBF24',
          low: '#F87171',
        },
      },
    },
  },
  plugins: [],
};
