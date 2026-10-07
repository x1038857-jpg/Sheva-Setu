import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1d4ed8',
        accent: '#f59e0b',
        ink: '#0f172a',
        soft: '#f8fafc',
      },
      boxShadow: {
        soft: '0 10px 25px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
