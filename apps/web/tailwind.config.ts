import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        accent: "var(--color-accent)",
        "pastel-blue": "var(--color-pastel-blue)",
        "pastel-pink": "var(--color-pastel-pink)",
        "pastel-yellow": "var(--color-pastel-yellow)",
      },
    },
  },
  plugins: [],
} satisfies Config;
