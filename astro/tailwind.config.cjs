/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      background: '#F1F5F9',
      login: '#E2E8F0',
      old: '#eeeeee',
      faGray: {
        light: '#e6e7e8',
        dark: '#3e4e50'
      },
      fuchsia: colors.fuchsia,
      gray: colors.slate,
      green: colors.teal,
      indigo: colors.indigo,
      blue: colors.blue,
      sky: colors.sky,
      orange: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f58320',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
      },
      red: colors.rose,
      rose: colors.pink,
      yellow: colors.yellow,
      slate: colors.slate,
      white: colors.white
    },
    extend: {
      backgroundImage: {
        'hero': 'url("/img/heroes/dots-code.svg")',
        'articles': 'radial-gradient(circle 768px at top right, rgb(199,210,254,0.95) 0%, rgba(255,255,255,0.95) 80%, rgba(255,255,255,1.0) 100%), url("/img/texture/grid.svg")',
        'articles-dark': 'radial-gradient(circle 768px at top right, rgba(55,48,163,0.75) 0%, rgba(15,23,42,0.75) 80%, rgba(15,23,42,1.0) 100%), url("/img/texture/grid.svg")'
        // 'articles': 'linear-gradient(90deg, rgba(15,23,42,1) 0%, rgba(15,23,42,1) 50%, rgba(99,102,241,0.50) 80%, rgba(15,23,42,0.75) 100%), linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.8) 50%, rgba(15,23,42,1.0) 80%, rgba(15,23,42,1.0) 100%), url("/img/texture/grid.svg")'
      },
      backgroundPosition: {
        'pos-hero': 'right 0 bottom 150px'
      },
      borderWidth: {
        '10': '10px'
      },
      boxShadow: {
        'aside': '0 2px 4px 0 rgba(0,0,13,0.14), 0 0 0 1px rgba(63,63,68,0.05), 0 1px 3px 0 rgba(63,63,68,0.15)',
        'dropdown': '0 9px 12px 1px rgba(0,0,0,0.14), 0 3px 16px 2px rgba(0,0,0,0.12), 0 5px 6px -3px rgba(0,0,0,0.20)',
        // 'dropdown': '0px 1px 1px 0px rgba(0, 28, 36, 0.3), 1px 1px 1px 0px rgba(0, 28, 36, 0.15), -1px 1px 1px 0px rgba(0, 28, 36, 0.15)',
        'panel': '0 1px 1px 0 rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12), 0 1px 3px 0 rgba(0,0,0,0.20)'
      },
      fontFamily: {
        'awesome': '"Font Awesome 6 Pro"'
      },
      keyframes: {
        logout: {
          'from': {
            width: '0'
          },
          'to': {
            width: '100%'
          },
        }
      },
      maxWidth: {
        '8xl': '90rem'
      },
      transformOrigin: {
        '0': '0%'
      },
      typography: {
        DEFAULT: {
          css: {
            'blockquote p:first-of-type::before': {
                content: 'none'
            },
            'blockquote p:first-of-type::after': {
                content: 'none'
            },
            'pre code': {
              backgroundColor: 'transparent !important',
              borderWidth: '0 !important',
              paddingLeft: '0 !important',
              paddingRight: '0 !important'
            },
            'code::after': {
              content: ''
            },
            'code::before': {
              content: ''
            },
            'h5': {
                fontWeight: '500'
            }
          },
        },
      },
    },
    fontFamily: {
      sans: [
        'Inter, -apple-system, system-ui, BlinkMacSystemFont, Arial, sans-serif',
        {
          fontFeatureSettings: '"case", "zero"'
        }
      ]
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
  variants: {
    borderColor: ['focus', 'focus-within', 'hover', 'responsive'],
  }
}
