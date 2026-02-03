import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F8FAFC', // Gray-50
          dark: '#020617',  // Slate-950
        },
        card: {
          light: '#FFFFFF',
          dark: '#0F172A',  // Slate-900
        },
        accent: {
          DEFAULT: '#6366F1', // Indigo-500
          cyan: '#22D3EE',    // Cyan-400
        },
        border: 'var(--border)',
        muted: 'var(--muted)',
        slate: {
          900: '#0F172A',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
};

export default config;
