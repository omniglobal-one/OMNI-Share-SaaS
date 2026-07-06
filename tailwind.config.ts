import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0E7490',
        'primary-hover': '#155E75',
        secondary: '#F59E0B',
        danger: '#DC2626',
        success: '#16A34A',
        bg: { base: '#F9FAFB', card: '#FFFFFF', border: '#E5E7EB' },
        text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' },
        dark: {
          bg: { base: '#0A0A0A', card: '#111111', border: 'rgba(255,255,255,0.08)' },
          text: { primary: '#F9FAFB', secondary: '#9CA3AF', tertiary: '#6B7280' },
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: { DEFAULT: '8px', lg: '8px', xl: '8px' },
      borderColor: { DEFAULT: '#E5E7EB' },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.05)',
        glow: '0 0 24px rgba(14, 116, 144, 0.35)',
      },
    },
  },
  plugins: [],
}
export default config
