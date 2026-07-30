module.exports = {
  content: [
    './content.js',
    './subscriptions.html',
    './popup.html',
  ],
  theme: {
    extend: {
      colors: {
        'infolders': {
          primary: '#7c3aed',
          secondary: '#a855f7',
          accent: '#c084fc',
          dark: '#1a1a1a',
          darker: '#0a0a0a',
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
