/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        stakent: {
          bg: '#0a0b10',
          sidebar: '#0e1017',
          card: '#12151f',
          'card-hover': '#161a27',
          subtle: '#181d2c',
          border: 'rgba(255, 255, 255, 0.06)',
          accent: '#6366f1',
          'accent-purple': '#8b5cf6',
        },
        dark: {
          950: '#070a13',
          900: '#0d1322',
          850: '#11182c',
          800: '#162038',
          700: '#1f2c4c',
          600: '#2c3c66',
        },
        ro: {
          gold: '#f59e0b',
          'gold-light': '#fbbf24',
          blue: '#0284c7',
          'blue-light': '#38bdf8',
          purple: '#9333ea',
          'purple-light': '#c084fc',
          red: '#ef4444',
          green: '#10b981',
        },
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'blue-glow': '0 0 25px -5px rgba(56, 189, 248, 0.35)',
        'purple-glow': '0 0 25px -5px rgba(168, 85, 247, 0.35)',
        'violet-glow': '0 0 28px -4px rgba(139, 92, 246, 0.45)',
        'indigo-glow': '0 0 28px -4px rgba(99, 102, 241, 0.45)',
        'green-glow': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'emerald-glow': '0 0 28px -4px rgba(16, 185, 129, 0.4)',
      },
    },
  },
  plugins: [],
};
