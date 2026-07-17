/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#c8601a', 50:'#fff7f0', 100:'#feebd8', 200:'#fcd3ae', 300:'#f9b57c', 400:'#f59048', 500:'#c8601a', 600:'#b35015', 700:'#923f10', 800:'#70300d', 900:'#52230a' },
        secondary: { DEFAULT: '#f5e6d0', 50:'#fdfaf6', 100:'#faf3e8', 200:'#f5e6d0', 300:'#edcfa8', 400:'#e3b27d', 500:'#d4905a', 600:'#b87040', 700:'#8f5230', 800:'#653a24', 900:'#3e251a' },
        accent:    { DEFAULT: '#2d6a4f', 50:'#f0f9f4', 100:'#dcf0e5', 200:'#b8deca', 300:'#85c5a5', 400:'#50a87b', 500:'#2d6a4f', 600:'#245642', 700:'#1c4334', 800:'#152e24', 900:'#0d1e18' },
        dark:      { DEFAULT: '#1a1a1a', card:'#242424', border:'#2e2e2e' },
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'hero-pattern':   "url('/images/hero-bg.jpg')",
        'warm-gradient':  'linear-gradient(135deg, #fff7f0 0%, #feebd8 50%, #fcd3ae 100%)',
        'dark-gradient':  'linear-gradient(135deg, #1a1a1a 0%, #242424 50%, #2e2e2e 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-slow':'bounce 2s infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:   { from:{ opacity:'0' },             to:{ opacity:'1' } },
        slideUp:  { from:{ opacity:'0', transform:'translateY(30px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideDown:{ from:{ opacity:'0', transform:'translateY(-10px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        float:    { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-10px)' } },
        shimmer:  { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
      },
      boxShadow: {
        'card':    '0 4px 20px rgba(200,96,26,0.12)',
        'card-lg': '0 8px 40px rgba(200,96,26,0.18)',
        'glow':    '0 0 25px rgba(200,96,26,0.4)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
