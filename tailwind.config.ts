import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Official Agri-Tech / Organic Palette
        forest: {
          DEFAULT: '#2C3E2D',
          50: '#F4F6F4',
          100: '#E4EAE4',
          200: '#C2D1C2',
          300: '#9FB89F',
          400: '#5F8560',
          500: '#3D553E',
          600: '#2C3E2D',
          700: '#233224',
          800: '#1B261C',
          900: '#131A13',
          950: '#0C110C',
        },
        sage: {
          DEFAULT: '#7A9471',
          50: '#F5F7F4',
          100: '#E9EFE7',
          200: '#D5E1D2',
          300: '#BDCFB9',
          400: '#9DB798',
          500: '#7A9471',
          600: '#647D5C',
          700: '#4F6348',
          800: '#3D4C38',
          900: '#2C3728',
        },
        wheat: {
          DEFAULT: '#D9C589',
          50: '#FAF8F0',
          100: '#F5F0E1',
          200: '#EBDDC1',
          300: '#E2CAA1',
          400: '#D9C589',
          500: '#C7B06E',
          600: '#A99252',
          700: '#83703E',
          800: '#5F512D',
          900: '#3D341D',
        },
        clay: {
          DEFAULT: '#6B4226',
          50: '#F9F5F2',
          100: '#F0E7E0',
          200: '#E0CDC1',
          300: '#CFB1A0',
          400: '#A36E4C',
          500: '#835434',
          600: '#6B4226',
          700: '#54331D',
          800: '#3E2515',
          900: '#29180E',
        },
        bone: {
          DEFAULT: '#F2EFE6',
          50: '#FAF9F6',
          100: '#F2EFE6',
          200: '#E5E0D2',
          300: '#D7D0BE',
          400: '#C5BCA6',
          500: '#B0A58C',
          600: '#948970',
          700: '#776D58',
          800: '#5B5343',
          900: '#403A2E',
        },
        // Semantic legacy compatibility mapped to organic colors
        primary: {
          DEFAULT: '#2C3E2D',
          hover: '#233224',
          light: '#7A9471',
        },
        secondary: {
          DEFAULT: '#7A9471',
          hover: '#647D5C',
          light: '#E9EFE7',
        },
        accent: '#D9C589',
        warning: {
          DEFAULT: '#C25438',
          light: '#FDF2F0',
        },
        statusOk: '#5B8C5A',
        statusWarn: '#C99738',
        statusDanger: '#B33929',
        darkCustom: '#1E2B1F',
        abu: '#F2EFE6',
        abu2: '#FAF9F6',
        abu3: '#E5E0D2',
        kuningCerah: '#D9C589'
      },
      fontFamily: {
        roboto: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(44, 62, 45, 0.04), 0 1px 3px rgba(44, 62, 45, 0.02)',
        'card': '0 4px 20px rgba(44, 62, 45, 0.06), 0 1px 4px rgba(44, 62, 45, 0.04)',
        'elevated': '0 10px 30px rgba(44, 62, 45, 0.08), 0 2px 8px rgba(44, 62, 45, 0.04)',
      }
    },
  },
  plugins: [],
};
export default config;
