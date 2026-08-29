import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        status: {
          green: "#16a34a",
          yellow: "#ca8a04",
          red: "#dc2626",
          manual: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};

export default config;
