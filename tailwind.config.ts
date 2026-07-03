import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        ink: "#17140E",
        paper: "#FBFAF6",
        oat: "#F1EFE8",
        muted: "#6A6559",
        violet: "#6D4AFF",
        lime: "#C9F24D",
        coral: "#FF6B5E",
        mint: "#2ECC71"
      },
      fontFamily: {
        display: ["Bricolage Grotesque", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 22px 70px rgba(23, 20, 14, 0.14)",
        glow: "0 24px 80px rgba(109, 74, 255, 0.28)"
      }
    }
  },
  plugins: []
} satisfies Config;
