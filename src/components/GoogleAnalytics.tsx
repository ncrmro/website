"use client";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import * as gtag from "./GoogleAnalytics.gtag";

export default function GoogleAnalytics() {
  if (typeof gtag.GA_TRACKING_ID === "undefined")
    throw new Error("Google analytics tracking ID is undefined");
  const pathname = usePathname();
  useEffect(() => {
    gtag.pageview(pathname);
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
