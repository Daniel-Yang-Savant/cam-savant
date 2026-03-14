import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        neutral: {
          50:  '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#171717',
            h1: { color: '#0A0A0A', fontWeight: '700' },
            h2: { color: '#0A0A0A', fontWeight: '700' },
            h3: { color: '#0A0A0A', fontWeight: '600' },
            h4: { color: '#0A0A0A', fontWeight: '600' },
            a: {
              color: '#0A0A0A',
              textDecoration: 'underline',
              '&:hover': { color: '#525252' },
            },
            blockquote: {
              borderLeftColor: '#D4D4D4',
              color: '#525252',
              fontStyle: 'normal',
            },
            hr: { borderColor: '#E5E5E5' },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            code: {
              backgroundColor: '#F5F5F5',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
              fontSize: '0.875em',
            },
            pre: {
              backgroundColor: '#0A0A0A',
              color: '#E5E5E5',
            },
            table: {
              fontSize: '0.9em',
            },
            'thead th': {
              color: '#0A0A0A',
              borderBottomColor: '#D4D4D4',
            },
            'tbody td': {
              borderBottomColor: '#E5E5E5',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
