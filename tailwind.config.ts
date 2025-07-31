import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bgColor: process.env.NEXT_PUBLIC_BACKGROUND_COLOR ?? "",
        primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "",
        secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR ?? "",
        textColor: process.env.NEXT_PUBLIC_TEXT_COLOR ?? "",
        orderingPrimaryTextColor:
          process.env.NEXT_PUBLIC_ORDERING_PRIMARY_TEXT_COLOR ?? "",

        // subTextColor: process.env.NEXT_PUBLIC_TEXT_COLOR ?? "",
        // buttonBgColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "",
        // buttonTextColor: process.env.NEXT_PUBLIC_BACKGROUND_COLOR ?? "",
        // bgCard: process.env.NEXT_PUBLIC_SECONDARY_COLOR ?? "",

        bgGray: "#f8f8f8",
        textGrayColor: "#8B8B8B",
        bg1: "#000000",
        bg2: "#dfb451",
        bg3: "#F8F8F8",
        bgbottom: "#E7E4DA",
        toptext: "#747474",
        box1: "#E7E4DA",
        box2: "#CFC9B5",
        subtext: "#2C312B",
        // Keep the existing HSL and other color configurations
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "",
          foreground: process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "",
        },
        secondary: {
          DEFAULT: process.env.NEXT_PUBLIC_SECONDARY_COLOR ?? "",
          foreground: process.env.NEXT_PUBLIC_SECONDARY_COLOR ?? "",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        primary: "var(--primary-font)",
        secondary: "var(--secondary-font)",
        "online-ordering": "var(--font-online-ordering)",
        rubik: ["var(--font-rubik)", "serif"],
        bebas: ["var(--font-bebas)", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        "8xl": "100rem",
      },
      screens: {
        xsm: "485px",
        "custom-lg": "980px",
        "custom-lg2": "1150px",
        "custom-sm": "600px",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".scrollbar-hide": {
          /* Hide scrollbar for Chrome, Safari and Opera */
          "&::-webkit-scrollbar": {
            display: "none",
          },
          /* Hide scrollbar for IE, Edge and Firefox */
          "-ms-overflow-style": "none" /* IE and Edge */,
          "scrollbar-width": "none" /* Firefox */,
        },
      });
    }),
  ],
} satisfies Config;
