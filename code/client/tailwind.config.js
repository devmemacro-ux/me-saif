/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: 'var(--bg-primary)', secondary: 'var(--bg-secondary)', tertiary: 'var(--bg-tertiary)' },
        text: { primary: 'var(--text-primary)', secondary: 'var(--text-secondary)', muted: 'var(--text-muted)' },
        accent: { DEFAULT: 'var(--accent-primary)', hover: 'var(--accent-hover)', glow: 'var(--accent-glow)' },
        border: { DEFAULT: 'var(--border-primary)', secondary: 'var(--border-secondary)' },
        status: { success: 'var(--status-success)', error: 'var(--status-error)', warning: 'var(--status-warning)' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
}
