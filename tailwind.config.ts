import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        mist: "#f5f8fb",
        signal: "#1f8f6a",
        saffron: "#f5b544",
      },
      boxShadow: {
        soft: "0 20px 55px rgba(23, 32, 51, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
