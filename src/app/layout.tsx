import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import UmamiAnalytics from "@/components/UmamiAnalytics";
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
        <UmamiAnalytics
          scriptUrl="https://umami.ncrmro.com/script.js"
          websiteId="8b476bdf-8835-4f55-8afc-9a4d78d16b13"
          domains={["ncrmro.com", "www.ncrmro.com"]}
        />
        {props.children}
      </body>
    </html>
  );
}
