import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
    theme: {
    extend: {
      transitionTimingFunction: {
        'custom-linear': 'linear(0, 0.012 0.9%, 0.05 2%, 0.411 9.2%, 0.517 11.8%, 0.611 14.6%, 0.694 17.7%, 0.765 21.1%, 0.824 24.8%, 0.872 28.9%, 0.91 33.4%, 0.939 38.4%, 0.977 50.9%, 0.994 68.4%, 1)',
      },
      colors: {
        blue: { 50: '#DFDFF0', 75: '#dfdff2', 100: '#F0F2FA', 200: '#010101', 300: '#4FB7DD' },
        violet: { 300: '#5724ff' },
        yellow: { 100: '#8e983f', 300: '#edff66' },
        primary: '#0b5a8e',
        'primary-light': '#17d2e3',
        secondary: '#3fb8af',
        accent: '#5dd9d1',
        foreground: '#1a2b3c',
        'text': '#1a2b3c',
      },
      // ... existing transitions ...
      keyframes: {
        hovering: { '0%,100%': { transform: 'translateY(-5px)' }, '50%': { transform: 'translateY(5px)' } },
        hoveringScale: { '0%,100%': { transform: 'translateY(30px) scale(1)' }, '50%': { transform: 'translateY(-30px) scale(1.1)' } },
          fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1', },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(60px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeLeft: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeRight: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
          scaleUp: {
          '0%': { opacity: '0', transform: 'translateY(-10px)',scale:'0.9' },
          '100%': { opacity: '1', transform: 'translateY(0)',scale:'1' },
        },
        snappyUp: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        snappyDown: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(30px) scale(0.9)' },
        },
        snappyRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        snappyToRight: {
          '0%': { opacity: '0', transform: 'translateX(-40px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        growUp: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'bottom', opacity: '0' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom', opacity: '1' },
        },
        jumpIn: {
          '0%': { transform: 'scale(0)' },
          '80%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        rotate3D: {
          '0%, 100%': { transform: 'translateY(10px) rotateX(-10deg) rotateY(10deg)' },
          '50%': { transform: 'translateY(-10px) rotateX(10deg) rotateY(-10deg)' },
        },
        overshoot: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeDownOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(40px)' },
        },
        scaleDownOut: {
          '0%': { opacity: '1', transform: 'translateY(0)', scale: '1' },
          '100%': { opacity: '0', transform: 'translateY(10px)', scale: '0.9' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-150%)' },
          '100%': { transform: 'translateX(350%)' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      },
      animation: {
        hovering: 'hovering 5s ease-in-out infinite',
        hoveringScale: 'hoveringScale 7s ease-in-out infinite',
        hoveringSlow: 'hovering 6.5s ease-in-out infinite',
        fade: 'fade 0.25s ease-out both',
        fadeDown: 'fadeDown 0.5s ease-out both',
        fadeUp: 'fadeUp 0.5s ease-out both',
        fadeLeft: 'fadeLeft 0.5s ease-out both',
        fadeRight: 'fadeRight 0.5s ease-out both',
        scaleUp: 'scaleUp 1s var(--snap) both',
        snappyUp: 'snappyUp 1s var(--snap) both',
        snappyDown: 'snappyDown 0.6s var(--snap) both',
        snappyRight: 'snappyRight 1s var(--snap) both',
        growUp: 'growUp 1s var(--easing) both',
        rotate3D: 'rotate3D 8s ease-in-out infinite',
        jumpIn: 'jumpIn 0.5s ease-out both',
        overshoot: 'overshoot 1s var(--overshoot) both',
        fadeDownOut: 'fadeDownOut 0.5s ease-in both',
        scaleDownOut: 'scaleDownOut 0.6s ease-in both',
        shimmer: 'shimmer 2s infinite linear',
        fadeOut: 'fadeOut 0.15s ease-in both',
        snappyToRight: 'snappyToRight 1s var(--snap) both',
      },
      // Keep the theme object for reference
      animationDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
      },
    },
    screens: {
      '2xs': '350px',
      xs: '480px',
      sm: '640px',
      md: '768px',
      special: '800px',
      lg: '1024px',
      larger: '1140px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    // Improved Animation Delay Plugin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function ({ addUtilities, matchUtilities, theme }: any) {
      // 1. Static utilities from the theme above
      const delays = theme('animationDelay');
      const staticDelayUtilities = Object.keys(delays).map((key) => ({
        [`.animate-delay-${key}`]: {
          'animation-delay': delays[key],
        },
      }));
      addUtilities(staticDelayUtilities);

      // 2. Match utilities for arbitrary values (e.g., animate-delay-[123ms])
      matchUtilities(
        {
          'animate-delay': (value: string) => ({
            'animation-delay': value,
          }),
        },
        { values: theme('animationDelay') }
      );
    },
  ],
};

export default config;
