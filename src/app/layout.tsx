import "./globals.css";
import Navbar from "@/components/Navbar";
import React from "react";

export const metadata = {
  title: "Vercel Postgres Demo with Kysely",
  description:
    "A simple Next.js app with Vercel Postgres as the database and Kysely as the ORM",
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
