import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Caribbean-inspired colors
        caribbean: {
          50: "#E6F9FF",  // Light Sky Blue
          100: "#B3E6FF", // Sky Blue
          200: "#80D4FF", // Ocean Blue
          300: "#4DC2FF", // Bright Ocean Blue
          400: "#1AB0FF", // Deep Ocean Blue
          500: "#008BE6", // Primary Caribbean Blue
          600: "#006DB3", // Deep Caribbean Blue
          700: "#004F80", // Dark Ocean Blue
          800: "#00324D", // Deep Sea Blue
          900: "#00141A", // Midnight Ocean
        },
        sand: {
          50: "#FFF9E6",  // Light Sand
          100: "#FFE4B3", // Pale Sand
          200: "#FFCF80", // Sandy Beige
          300: "#FFBA4D", // Golden Sand
          400: "#FFA51A", // Warm Sand
          500: "#E68A00", // Deep Sand
          600: "#B36B00", // Dark Sand
          700: "#804C00", // Brown Sand
          800: "#4D2E00", // Dark Brown Sand
          900: "#1A0F00", // Deep Brown Sand
        },
        coral: {
          50: "#FFE6E6",  // Light Coral
          100: "#FFB3B3", // Pale Coral
          200: "#FF8080", // Soft Coral
          300: "#FF4D4D", // Bright Coral
          400: "#FF1A1A", // Vibrant Coral
          500: "#E60000", // Deep Coral
          600: "#B30000", // Dark Coral
          700: "#800000", // Deep Red Coral
          800: "#4D0000", // Very Dark Coral
          900: "#1A0000", // Darkest Coral
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
