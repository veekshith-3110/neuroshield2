/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        burnout: {
          low: '#10b981',
          moderate: '#f59e0b',
          high: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}

