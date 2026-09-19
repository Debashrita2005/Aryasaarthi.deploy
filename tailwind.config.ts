import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        gov: {
          blue: '#1e3a8a',
          navy: '#0f172a',
          saffron: '#d97706',
          green: '#15803d',
        },
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      fontSize: {
        'rural-base': ['1.0625rem', { lineHeight: '1.65rem' }], // 17px base for effortless reading
        'rural-lg': ['1.25rem', { lineHeight: '1.75rem' }],
      },
    },
  },
  plugins: [],
};
export default config;
