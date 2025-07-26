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
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0px)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)' },
          '100%': { transform: 'translateX(0px)' },
        },
      },
    },
  },
  plugins: [],
};
