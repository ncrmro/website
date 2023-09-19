import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Navbar from "@/components/Navbar";
import React from "react";

export const metadata = {
  title: "Nicholas Romero",
  description: "Personal Site of Nicholas Romero",
};
const isProduction = process.env.NODE_ENV === "production";

export default async function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {isProduction && <GoogleAnalytics />}
        {props.children}
      </body>
    </html>
  );
}
