/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        card: '#1a1a1a',
        'card-border': '#2a2a2a',
        primary: '#7c3aed',
        'primary-light': '#9d5cf6',
        'primary-dark': '#5b21b6',
        accent: '#d4a017',
        'accent-light': '#e8b825',
        text: {
          primary: '#ffffff',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
        mana: {
          white: '#f9fafb',
          blue: '#3b82f6',
          black: '#1f2937',
          red: '#ef4444',
          green: '#22c55e',
          colorless: '#9ca3af',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
