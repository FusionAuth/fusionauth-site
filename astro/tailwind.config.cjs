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
			animation: {
				logout: 'logout 5s ease-out infinite'
			},
			backgroundImage: {
				'hero': 'url("/img/heroes/dots-code.svg"), radial-gradient(circle farthest-side at 0 0, #0f172a, #3e67fc 73%, #1e293b)'
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
		},
		fontFamily: {
			sans: ['-apple-system', 'system-ui', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif']
		}
	},
	plugins: [
		require('@tailwindcss/typography')
	],
	variants: {
		borderColor: ['focus', 'focus-within', 'hover', 'responsive']
	}
}
