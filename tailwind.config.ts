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
          950: "#070A12",
          900: "#101522",
          850: "#151B2B",
          800: "#273149",
        },
        signal: {
          cyan: "#48E0C2",
          teal: "#48E0C2",
          green: "#48E0C2",
          violet: "#8B5CF6",
          amber: "#F6B44B",
          ember: "#F9735B",
        },
        parchment: "#F3F0E8",
        muted: "#A7ADBC",
      },
      boxShadow: {
        glow: "0 0 42px rgba(72, 224, 194, 0.18)",
        heat: "0 0 48px rgba(249, 115, 91, 0.24)",
      },
      backgroundImage: {
        "star-field":
          "radial-gradient(circle at 20% 20%, rgba(72, 224, 194, 0.12), transparent 28%), radial-gradient(circle at 78% 16%, rgba(139, 92, 246, 0.12), transparent 24%), radial-gradient(circle at 50% 85%, rgba(246, 180, 75, 0.1), transparent 32%)",
      },
    },
  },
  plugins: [],
};

export default config;
