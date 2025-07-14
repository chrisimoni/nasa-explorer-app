/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base dark tones
        space: {
          900: "#0A0A0F", // Deepest dark, almost black
          800: "#11111A", // Slightly lighter dark for backgrounds
          700: "#1A1A26", // Dark gray/blue for cards/sections
          600: "#232333", // Lighter dark for subtle borders/dividers
        },
        // Primary text/accents (starlight)
        starlight: {
          50: "#F0F3F9", // Very light, almost white
          100: "#DDE2E8", // Light gray
          200: "#BBC5D4", // Medium light gray
        },
        // Accent colors (nebula-inspired)
        nebula: {
          DEFAULT: "#8A2BE2", // Blue Violet
          50: "#F5ECFF",
          100: "#E0CCFF",
          200: "#C299FF",
          300: "#A366FF",
          400: "#8533FF",
          500: "#6600FF", // Vivid violet
          600: "#5200CC",
          700: "#3D0099",
          800: "#290066",
          900: "#140033",
        },
        // Another accent for variety
        comet: {
          DEFAULT: "#00BCD4", // Cyan
          50: "#E0F8FB",
          100: "#B3F0F5",
          200: "#80E7ED",
          300: "#4DDEE5",
          400: "#1AD5DD",
          500: "#00BCD4", // Vivid Cyan
          600: "#0097A7",
          700: "#00717D",
          800: "#004B54",
          900: "#00262A",
        },
        // A subtle glow/highlight
        glow: "#FFD700", // Gold for highlights
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Orbitron", "sans-serif"],
      },
      // Ensure borderRadius and boxShadow are also defined if theme() is used for them
      borderRadius: {
        lg: "0.5rem", // Default large border radius
        md: "0.375rem", // Default medium border radius
      },
      boxShadow: {
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", // Default xl shadow
      },
      spacing: {
        // Add this explicitly to ensure 0.5 is recognized by theme()
        0.5: "0.125rem", // 2px
        1: "0.25rem", // 4px
        2: "0.5rem", // 8px
        3: "0.75rem", // 12px
        4: "1rem", // 16px
        8: "2rem", // 32px
      },
    },
  },
  plugins: [],
};
