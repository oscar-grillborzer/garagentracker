/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: '#09090b',
        surface: '#111113',
        border: '#1c1c1f',
        'border-2': '#27272a',
        muted: '#52525b',
        subtle: '#3f3f46',
        text: '#fafafa',
        'text-2': '#a1a1aa',
        accent: '#fafafa',
        green: '#4ade80',
        cyan: '#22d3ee',
        amber: '#f59e0b',
        purple: '#a78bfa',
        red: '#f87171',
      },
      fontSize: {
        base: ['13px', { lineHeight: '1.6', letterSpacing: '-0.1px' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
    },
  },
  plugins: [],
}
