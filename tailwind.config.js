/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#0d6efd', hover: '#0b5ed7', light: '#cfe2ff', dark: '#052c65' },
        success: { DEFAULT: '#198754', light: '#d1e7dd', dark: '#0a3622' },
        danger:  { DEFAULT: '#dc3545', light: '#f8d7da', dark: '#58151c' },
        warning: { DEFAULT: '#ffc107', light: '#fff3cd', dark: '#664d03' },
        sidebar: { DEFAULT: '#1e293b', hover: '#334155', active: '#0d6efd', text: '#e2e8f0', muted: '#94a3b8' },
      },
    },
  },
  plugins: [],
}
