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
        navy: {
          DEFAULT: "#1B2330",
          deep:    "#0D1520",
          soft:    "#252E3D",
          light:   "#2A3545",
        },
        teal: {
          DEFAULT: "#00A8A8",
          dark:    "#008080",
          light:   "#00CCCC",
          glow:    "#00E5E5",
        },
        gray3tt: "#9AA3AF",
        gray: "#9AA3AF",
        offwhite: "#F2F2F2",
      },
      fontFamily: {
        display: ["var(--font-display)", "Bebas Neue", "Impact", "sans-serif"],
        body: ["var(--font-body)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-60px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(60px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.8)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%":      { opacity: "0.8" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-15px) rotate(2deg)" },
          "66%":      { transform: "translateY(5px) rotate(-1deg)" },
        },
        "drift": {
          "0%":   { transform: "translate(0, 0) rotate(0deg)" },
          "25%":  { transform: "translate(10px, -20px) rotate(90deg)" },
          "50%":  { transform: "translate(-5px, -40px) rotate(180deg)" },
          "75%":  { transform: "translate(-15px, -20px) rotate(270deg)" },
          "100%": { transform: "translate(0, 0) rotate(360deg)" },
        },
        "line-draw": {
          from: { strokeDashoffset: "1000" },
          to:   { strokeDashoffset: "0" },
        },
        "shimmer": {
          from: { backgroundPosition: "-200% center" },
          to:   { backgroundPosition: "200% center" },
        },
        "ball-bounce": {
          "0%":   { transform: "translate(0, 0)" },
          "15%":  { transform: "translate(120px, -180px)" },
          "30%":  { transform: "translate(240px, 0)" },
          "45%":  { transform: "translate(360px, -140px)" },
          "60%":  { transform: "translate(480px, 0)" },
          "100%": { transform: "translate(480px, 0)", opacity: "0" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up":        "fade-up 0.8s ease-out both",
        "fade-in":        "fade-in 0.6s ease-out both",
        "slide-in-left":  "slide-in-left 0.8s ease-out both",
        "slide-in-right": "slide-in-right 0.8s ease-out both",
        "scale-in":       "scale-in 0.6s ease-out both",
        "glow-pulse":     "glow-pulse 3s ease-in-out infinite",
        "float":          "float 8s ease-in-out infinite",
        "drift":          "drift 20s linear infinite",
        "line-draw":      "line-draw 2s ease-out both",
        "shimmer":        "shimmer 3s ease-in-out infinite",
        "ball-bounce":    "ball-bounce 3s ease-in-out both",
        "count-up":       "count-up 0.5s ease-out both",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-gradient": "radial-gradient(at 40% 20%, rgba(0,168,168,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0,168,168,0.08) 0px, transparent 50%), radial-gradient(at 0% 80%, rgba(0,204,204,0.1) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
