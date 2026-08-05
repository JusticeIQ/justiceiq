import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#0b0e14",
          900: "#11151d",
          850: "#161b25",
          800: "#1c222e",
          700: "#293142",
          600: "#3a4459",
          500: "#535f78",
          400: "#7c8aa5",
          300: "#a3add0",
          200: "#c7cede",
          100: "#e6e9f0",
          50: "#f5f6f9",
        },
        teal: {
          50: "#effcfb",
          100: "#c9f5f1",
          400: "#2dd4c8",
          500: "#0fb8ac",
          600: "#0a9389",
          700: "#0a746c",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(11,14,20,0.08), 0 1px 2px rgba(11,14,20,0.06)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
