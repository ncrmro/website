/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        default: ["var(--font-inter)"],
      },
    },
    // colors: {
    //   background: "var(--background)",
    //   "on-background": "var(--on-background)",
    // },
  },
  plugins: [require("@tailwindcss/forms")],
};
