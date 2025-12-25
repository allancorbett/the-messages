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
        // Scottish landscape palette
        peat: {
          50: "#faf9f7",
          100: "#f3f1ed",
          200: "#e5e1d8",
          300: "#d2cab9",
          400: "#b9ae96",
          500: "#a4967b",
          600: "#978769",
          700: "#7d6e58",
          800: "#675b4b",
          900: "#554c40",
          950: "#2d2821",
        },
        heather: {
          50: "#faf5ff",
          100: "#f4e8ff",
          200: "#ebd5ff",
          300: "#dab4fe",
          400: "#c184fc",
          500: "#a855f7",
          600: "#8b22ea",
          700: "#7613ce",
          800: "#6415a8",
          900: "#531687",
        },
        brine: {
          50: "#f0f9f6",
          100: "#dbf0e8",
          200: "#bae0d4",
          300: "#8bc9b7",
          400: "#58ab95",
          500: "#3a9079",
          600: "#2c7462",
          700: "#275d51",
          800: "#234b43",
          900: "#203f39",
        },
        oat: {
          50: "#fdfcf9",
          100: "#faf6ed",
          200: "#f3ead5",
          300: "#e9d9b6",
          400: "#dcc28f",
          500: "#d0ab6e",
          600: "#c29456",
          700: "#a27746",
          800: "#84613e",
          900: "#6c5035",
        },
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
        body: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "Monaco", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "slide-down": "slideDown 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
