import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  // ...
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'InterVariable', 'Inter', ...defaultTheme.fontFamily.sans],      },
    },
  },
}