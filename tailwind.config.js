/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#090b10',
          card: '#111520',
          border: '#1e2638',
          accent: '#00f0ff',
          pink: '#ff007f',
          purple: '#9d00ff',
          emerald: '#00ff88',
          amber: '#ffaa00'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 12s linear infinite'
      },
      keyframes: {
        glowCyan: {
          '0%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.6)' }
        }
      }
    }
  },
  plugins: []
};
