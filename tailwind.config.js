/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"TASA Orbiter"', 'sans-serif'],
      },
      colors: {
        farm: {
          primary: '#2E4A1F',
          secondary: '#C4B99D',
          accent: '#D1A344',
          bg: '#F4F6F0',
          text: '#1A1A1A',
          sidebar: '#2B4222',
          sidebarActive: '#425F33',
          sidebarText: '#D1D5DB',
          sidebarAccent: '#9BB92F',
          superSidebar: '#3B2A1D',
          superSidebarActive: '#5C4632',
        }
      }
    },
  },
  plugins: [],
}
