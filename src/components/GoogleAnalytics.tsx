"use client";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import * as gtag from "./GoogleAnalytics.gtag";

export default function GoogleAnalytics() {
  //You can show in the console the GA_TRACKING_ID to confirm
  console.log("GA", gtag.GA_TRACKING_ID);
  const pathname = usePathname();

  useEffect(() => {
    console.log(pathname);
  }, [pathname]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${gtag.GA_TRACKING_ID}', {
                      page_path: window.location.pathname,
                      });
                    `,
        }}
      />
    </>
  );
}
