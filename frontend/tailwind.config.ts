import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        unitec: {
            yellow: "#FFD200", // PANTONE 116C
            "blue-gray": "#6E7891", // PANTONE 430C
            "dark-blue": "#002B5C", // Deep Blue for Header/Button (Estimated from image)
            gray: "#3C3C3C", // PANTONE Black 7C
        }
      },
    },
  },
  plugins: [],
};
export default config;
