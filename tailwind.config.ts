import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0B0D",
          900: "#101216",
          800: "#1A1D23",
          700: "#272B33",
          600: "#3A3F4A",
        },
        bone: {
          50: "#FAF8F3",
          100: "#F2EFE7",
          200: "#E4DFD2",
          300: "#C9C2B1",
          400: "#8E8878",
        },
        lime: {
          50: "#EFFFA3",
          300: "#D6FF4A",
          500: "#B8F000",
          700: "#7A9F00",
        },
        coral: {
          300: "#FFB4A2",
          500: "#FF5C3A",
          700: "#B73417",
        },
        indigo: {
          300: "#A5B4FC",
          500: "#5B6EE8",
          700: "#3A4DB8",
        },
        mint: {
          300: "#A5F3D6",
          500: "#22C39A",
          700: "#0E8B68",
        },
        amber: {
          300: "#FCD34D",
          500: "#F59E0B",
          700: "#B45309",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        eyebrow: "0.12em",
      },
    },
  },
  plugins: [],
};

export default config;
