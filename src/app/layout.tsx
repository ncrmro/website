import "./globals.css";
import Navbar from "@/components/Navbar";
import React from "react";

export const metadata = {
  title: "Nicholas Romero",
  description: "Personal Site of Nicholas Romero",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="w-full flex flex-col items-center p-4">
          {props.children}
        </main>
      </body>
    </html>
  );
}
