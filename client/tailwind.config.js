/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // ─── LIGHT MODE: Forest → Ocean ───────────────────────────────────
        // Primary: deep forest green → ocean teal
        primary: {
          50:  '#f0fdfb',
          100: '#ccfbf4',
          200: '#99f5e8',
          300: '#5de8d6',
          400: '#2dd4c0',
          500: '#0d9488',   // mid-blend teal
          600: '#0e7490',   // ocean teal (main CTA)
          700: '#155e75',
          800: '#164e63',
          900: '#0c3547',
          950: '#062030',
        },
        // Emerald stays as forest green for badges, success states
        emerald: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',   // neon green (dark mode hero)
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Secondary: ocean blue
        ocean: {
          50:  '#eff8ff',
          100: '#dbeffe',
          200: '#b9e0fd',
          300: '#7bc8fb',
          400: '#38aaf5',
          500: '#0e8dd6',   // ocean blue secondary
          600: '#1d6fa4',   // secondary buttons / links
          700: '#1a5c8a',
          800: '#1a4c70',
          900: '#1a405e',
          950: '#112840',
        },
        // Accent: warm amber/orange
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',   // accent orange
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // ─── DARK MODE: Midnight Civic ─────────────────────────────────────
        // Navy backgrounds
        navy: {
          50:  '#e8edf5',
          100: '#c3cedf',
          200: '#8fa4c0',
          300: '#5a7aa1',
          400: '#345e8a',
          500: '#1e3a5f',
          600: '#162d4a',   // card bg
          700: '#0f2038',   // deeper card
          800: '#0a1628',   // page bg dark
          900: '#060e1a',   // deepest bg
          950: '#030810',
        },
        // Electric sky blue (dark accent pills)
        sky: {
          50:  '#f0faff',
          100: '#d9f3fe',
          200: '#b2e8fd',
          300: '#68d5fb',
          400: '#1bbef5',
          500: '#00b4ff',   // electric sky
          600: '#0094d6',
          700: '#006fa6',
          800: '#005a87',
          900: '#004a6e',
        },
        // Keep brand tokens
        brand: {
          blue:    '#0e8dd6',
          teal:    '#0d9488',
          green:   '#22c55e',
          sky:     '#00b4ff',
          amber:   '#f59e0b',
          rose:    '#f43f5e',
        },
        // Keep coral for error/danger
        coral: {
          50:  '#fff4f2',
          100: '#ffe4de',
          200: '#ffc7ba',
          300: '#ffa088',
          400: '#ff7a5c',
          500: '#fc5a37',
          600: '#ea3f1e',
          700: '#c22f14',
          800: '#9c2915',
          900: '#812617',
        },
        electric: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#5fa8ff',
          500: '#2f7dff',
          600: '#155bf0',
          700: '#0f46c4',
          800: '#12399b',
          900: '#14337a',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card':          '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover':    '0 20px 25px -5px rgba(14, 116, 144, 0.14), 0 8px 10px -6px rgba(14, 116, 144, 0.10)',
        'glow-primary':  '0 0 28px -4px rgba(14, 116, 144, 0.45)',
        'glow-emerald':  '0 0 28px -4px rgba(34, 197, 94, 0.45)',
        'glow-sky':      '0 0 28px -4px rgba(0, 180, 255, 0.45)',
        'glow-amber':    '0 0 28px -4px rgba(245, 158, 11, 0.45)',
        'float-card':    '0 12px 32px -8px rgba(6, 14, 26, 0.22)',
      },
      backgroundImage: {
        // Light mode: Forest → Ocean gradient
        'gradient-brand':      'linear-gradient(135deg, #1d7a4e 0%, #0d9488 45%, #0e7490 75%, #1d6fa4 100%)',
        'gradient-ocean':      'linear-gradient(135deg, #0d9488 0%, #0e7490 50%, #1d6fa4 100%)',
        // Dark mode: Midnight Civic gradient
        'gradient-midnight':   'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0d3320 100%)',
        'gradient-civic-hero': 'linear-gradient(135deg, #0a1628 0%, #0f2038 40%, #0d3320 100%)',
        'gradient-card':       'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(240,249,255,1) 100%)',
        'gradient-dark-card':  'linear-gradient(180deg, rgba(10,22,40,0.95) 0%, rgba(6,14,26,1) 100%)',
        'gradient-sunset':     'linear-gradient(135deg, #fc5a37 0%, #fb923c 50%, #fbbf24 100%)',
        // Light mode mesh
        'gradient-mesh':       'radial-gradient(at 0% 0%, rgba(13,148,136,0.22) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(14,116,144,0.22) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(245,158,11,0.14) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(0,180,255,0.14) 0px, transparent 50%)',
        // Dark mode mesh
        'gradient-mesh-dark':  'radial-gradient(at 0% 0%, rgba(34,197,94,0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0,180,255,0.10) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(13,148,136,0.10) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(14,116,144,0.08) 0px, transparent 50%)',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp:  { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ '0%': { transform: 'translateX(-16px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.94)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        floatY:    { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        floatYSlow:{ '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' }, '50%': { transform: 'translateY(-6px) rotate(1deg)' } },
        heartPop:  { '0%': { transform: 'scale(1)' }, '30%': { transform: 'scale(1.4)' }, '60%': { transform: 'scale(0.9)' }, '100%': { transform: 'scale(1)' } },
        marquee:   { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: {
        fadeIn:    'fadeIn 0.5s ease-out both',
        fadeInUp:  'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        slideRight:'slideRight 0.3s ease-out both',
        scaleIn:   'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        float:     'floatY 5s ease-in-out infinite',
        floatSlow: 'floatYSlow 7s ease-in-out infinite',
        heartPop:  'heartPop 0.4s ease-in-out',
        marquee:   'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
}
