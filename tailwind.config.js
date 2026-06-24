/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      colors: {
        primary: {
          DEFAULT: '#5B8A72',
          light: '#E8F0EB',
          dark: '#3D6B52',
          50: '#F2F7F4',
          100: '#E8F0EB',
          200: '#D1E1D7',
          300: '#A8C8B5',
          400: '#7BAE92',
          500: '#5B8A72',
          600: '#4A7460',
          700: '#3D6B52',
          800: '#345843',
          900: '#2C4A38',
        },
        accent: {
          DEFAULT: '#D4856B',
          light: '#F5E6DE',
          dark: '#B56B52',
        },
        secondary: {
          DEFAULT: '#7BAEC4',
          light: '#DDEBF2',
          dark: '#5B8FA8',
        },
        warning: '#E89B6B',
        caution: '#E8B86B',
        danger: '#D46B6B',
        bg: {
          DEFAULT: '#FAF6F0',
          dark: '#1A1F1B',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#242A25',
        },
        surface: {
          DEFAULT: '#F5F1EB',
          dark: '#2D342F',
        },
        border: {
          DEFAULT: '#E5E0D8',
          dark: '#3A4239',
        },
        text: {
          DEFAULT: '#2C3E2D',
          secondary: '#6B7B6E',
          hint: '#9CA39E',
          dark: '#E8EDE8',
          'secondary-dark': '#A0A8A2',
        },
        emotion: {
          happy: '#F4C95D',
          calm: '#7BAE92',
          normal: '#B5B5A8',
          low: '#9B8EC4',
          anxious: '#E89B6B',
          sad: '#6B9BC4',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['"Noto Serif SC"', '"Noto Sans SC"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', '1.5'],
        'sm': ['14px', '1.6'],
        'base': ['16px', '1.7'],
        'lg': ['18px', '1.5'],
        'xl': ['20px', '1.4'],
        '2xl': ['24px', '1.35'],
        '3xl': ['30px', '1.3'],
        '4xl': ['36px', '1.25'],
        '5xl': ['48px', '1.2'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
        '5xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slideDown 0.4s ease-out',
        'bounce-slow': 'bounceSlow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'modal-in': 'modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'toast-slide': 'toastSlide 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'tab-switch': 'tabSwitch 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'draw-line': 'drawLine 1.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-6px) rotate(2deg)' },
          '66%': { transform: 'translateY(4px) rotate(-1deg)' },
        },
        modalIn: {
          '0%': { transform: 'scale(0.92) translateY(16px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        toastSlide: {
          '0%': { transform: 'translateY(-120%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        tabSwitch: {
          '0%': { transform: 'translateX(8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(44, 62, 45, 0.04), 0 4px 12px rgba(44, 62, 45, 0.06)',
        'soft-lg': '0 2px 8px rgba(44, 62, 45, 0.06), 0 8px 24px rgba(44, 62, 45, 0.08)',
        'card': '0 1px 3px rgba(44, 62, 45, 0.04), 0 6px 16px rgba(44, 62, 45, 0.05)',
        'card-hover': '0 4px 12px rgba(44, 62, 45, 0.08), 0 12px 32px rgba(44, 62, 45, 0.1)',
        'glow-primary': '0 0 0 3px rgba(91, 138, 114, 0.15), 0 4px 16px rgba(91, 138, 114, 0.2)',
        'inner-soft': 'inset 0 1px 2px rgba(44, 62, 45, 0.04)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
