/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core Palette based on PRD: Slate, Cyan, Emerald
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#070c18',
        },
        cyan: {
          450: '#14b8db',
          500: '#06b6d4',
          950: '#04222f',
        },
        emerald: {
          450: '#10c487',
          500: '#10b981',
          950: '#022417',
        },
        // Hermes Trinity Specific Branding
        hermes: {
          bg: '#070C18',
          card: '#0D1527',
          cardHover: '#131F38',
          border: '#1E2C47',
          accent: '#06B6D4', // Trinity Cyan
          success: '#10B981', // Trinity Emerald
          warning: '#F59E0B',
          danger: '#EF4444',
          trinityAlpha: '#06B6D4',  // Engine Alpha (Momentum / Trend)
          trinityBeta: '#10B981',   // Engine Beta (Arbitrage / Delta Neutral)
          trinityGamma: '#6366F1',  // Engine Gamma (High Frequency Liquidity)
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
        'glow-emerald': 'glowEmerald 2s ease-in-out infinite alternate',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        glowCyan: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)' },
        },
        glowEmerald: {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)' },
        },
        scan: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
      },
    },
  },
  plugins: [],
};
