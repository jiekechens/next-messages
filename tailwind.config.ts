import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 🌟 在这里添加动画
      animation: {
        'a1': 'a1 2s infinite',
        'loader': 'loader .4s infinite alternate',
        'come': 'come 1s linear forwards',
      'scale': 'scale .5s ease-in-out forwards',
      'bounce-ani': 'beBig2 0.4s linear forwards',
      'updone': 'updone 0.5s linear infinite alternate-reverse',
      'hide-toast': 'hideToast 3s linear forwards',
      },
      keyframes: {
        updone: {
        '0%': { transform: 'translate(-50%, -50%) translateY(0)' },
        '100%': { transform: 'translate(-50%, -50%) translateY(-10px)' },
      },
        a1: {
          '0%, 100%': { transform: 'translateY(0rem)', opacity: '0.2' },
          '60%': { transform: 'translateY(-0.1rem)', opacity: '1' },
        },
        loader: {
          to: { opacity: '1', transform: 'translate3d(0, -0.16rem, 0)' }
        },
        shakeSlow: {
        '0%': { transform: 'scale(1) rotate(-30deg)' },
        '50%': { transform: 'scale(1) rotate(0deg)' },
        '100%': { transform: 'scale(1) rotate(30deg)' },
      },
      come: {
        '0%': { opacity: '0', transform: 'scale(0)' },
        '100%': { opacity: '1', transform: 'scale(1)' },
      },
      scale: {
        '0%': { transform: 'scale(0)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      hideToast: {
        '0%, 50%': { opacity: '1', top: '50%' },
        '100%': { opacity: '0', top: '45%' },
      }
      }
    },
  },
  plugins: [],
};

export default config;