import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bull: {
          orange: '#E8641B',
          dark: '#121417',
          text: '#171717',
          muted: '#6B7280',
          line: '#E7E2DA',
          soft: '#F6F3EE'
        }
      },
      boxShadow: {
        soft: '0 14px 40px rgba(20, 20, 20, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
