import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#FFFFFF',
        'bg-surface': '#F5F5F5',
        'bg-elevated': '#EEEEEE',
        'bg-subtle': '#E8E8E8',
        border: '#CCCCCC',
        'border-strong': '#AAAAAA',
        'text-primary': '#1A1A1A',
        'text-secondary': '#4A4A4A',
        'text-muted': '#777777',
        'accent-blue': '#3B82F6',
        'accent-purple': '#8B5CF6',
        'accent-cyan': '#06B6D4',
        'accent-orange': '#F97316',
        'status-stable': '#22C55E',
        'status-warning': '#EAB308',
        'status-critical': '#EF4444',
        'status-offline': '#6B7280'
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
} satisfies Config
