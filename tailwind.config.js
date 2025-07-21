/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['App.{js,jsx,ts,tsx}', 'app/**/*.{js,jsx,ts,tsx}', 'src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        jarsPrimary: '#2E5D46',
        jarsSecondary: '#8CD24C',
        jarsBackground: '#F9F9F9',
        jarsTextDark: '#333333',
        jarsLightGray: '#EEEEEE',
      },
    },
  },
  plugins: [],
};
