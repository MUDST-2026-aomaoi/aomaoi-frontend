/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          primary: '#435834',
          secondary: '#C4B99D',
          accent: '#D1A344',
          bg: '#F5F2E9',
          text: '#2C2C2C',
        }
      }
    },
  },
  plugins: [],
}
