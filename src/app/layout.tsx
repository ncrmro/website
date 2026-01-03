import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import UmamiAnalytics from "@/components/UmamiAnalytics";
import { Toaster } from "sonner";
import React from "react";

export const metadata = {
  title: "Nicholas Romero",
  description: "Personal Site of Nicholas Romero",
  manifest: "/manifest.json",
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

export const viewport = {
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
        <Toaster
          position="bottom-center"
          theme="system"
          toastOptions={{
            classNames: {
              toast: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
              title: 'text-gray-900 dark:text-white',
              description: 'text-gray-500 dark:text-gray-400',
              actionButton: 'bg-indigo-600 text-white',
              cancelButton: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white',
              closeButton: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400',
            },
          }}
        />
        {props.children}
      </body>
    </html>
  );
}
