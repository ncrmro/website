import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import React from "react";

export const metadata = {
  title: "Nicholas Romero",
  description: "Personal Site of Nicholas Romero",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
};
const isProduction = process.env.NODE_ENV === "production";

export default async function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark:bg-gray-900 dark:text-white">
      <body>
        {isProduction && <GoogleAnalytics />}
        {props.children}
      </body>
    </html>
  );
}
