import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mystic: {
          dark: "#020617",     // Zemin: Derin Uzay Siyahı
          purple: "#7c3aed",   // Vurgu: Neon Mor
          gold: "#fbbf24",     // Detay: Altın Sarısı
          glass: "rgba(255, 255, 255, 0.05)", // Efekt: Buzlu Cam
        },
      },
      backgroundImage: {
        "mystic-gradient": "linear-gradient(to bottom, #020617, #1e1b4b)", // Siyahtan mora geçiş
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Yavaş nefes alma efekti
      }
    },
  },
  plugins: [],
};
export default config;