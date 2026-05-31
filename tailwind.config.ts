import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          950: "#030711",
          900: "#07101d",
          850: "#0a1424",
          800: "#0e1a2b",
        },
        signal: {
          cyan: "#53e5f5",
          teal: "#2ee6c6",
          green: "#a8ffbf",
          amber: "#ffc46b",
          ember: "#ff705c",
        },
      },
      boxShadow: {
        glow: "0 0 42px rgba(83, 229, 245, 0.18)",
        heat: "0 0 48px rgba(255, 112, 92, 0.24)",
      },
      backgroundImage: {
        "star-field":
          "radial-gradient(circle at 20% 20%, rgba(83, 229, 245, 0.14), transparent 28%), radial-gradient(circle at 78% 16%, rgba(168, 255, 191, 0.1), transparent 24%), radial-gradient(circle at 50% 85%, rgba(255, 196, 107, 0.1), transparent 32%)",
      },
    },
  },
  plugins: [],
};

export default config;
