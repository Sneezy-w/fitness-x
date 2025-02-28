/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#E50914", // Netflix-inspired red
        secondary: "#141414", // Dark black
        accent: "#B81D24", // Darker red
        neutral: "#262626", // Medium black
        "base-100": "#0A0A0A", // Light black
        info: "#3ABFF8",
        success: "#36D399",
        warning: "#FBBD23",
        error: "#F87272",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        fitnessX: {
          primary: "#E50914", // Netflix-inspired red
          secondary: "#141414", // Dark black
          accent: "#B81D24", // Darker red
          neutral: "#262626", // Medium black
          "base-100": "#0A0A0A", // Light black
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
      "light",
      "dark",
    ],
    darkTheme: "fitnessX",
  },
};
