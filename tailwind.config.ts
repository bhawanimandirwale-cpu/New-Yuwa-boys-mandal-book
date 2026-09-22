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
        saffron: {
          50: "#fff8f1",
          100: "#feeedb",
          200: "#fcdab7",
          300: "#f9bc87",
          400: "#f79653",
          500: "#F67020", // Core Brand Festive Saffron
          600: "#e45311",
          700: "#bd3c0f",
          800: "#963114",
          900: "#7b2a14",
          950: "#431207",
        },
        marigold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        festive: {
          dark: "#1A1A1A",
          gold: "#D4AF37",
          cream: "#FFFDF9",
          card: "#FFFFFF",
          border: "#F1F1F4",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        heading: ["var(--font-baloo)", "sans-serif"],
        body: ["var(--font-mukta)", "sans-serif"],
      },
      boxShadow: {
        mandal: "0 4px 20px -2px rgba(246, 112, 32, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        card: "0 2px 10px rgba(0, 0, 0, 0.04)",
        float: "0 10px 30px -5px rgba(246, 112, 32, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
