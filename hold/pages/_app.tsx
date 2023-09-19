import "../../src/styles/globals.css";
import "../../src/app/posts/[slug]/code-block.css";
import SiteLayout from "@components/SiteLayout";
import { Head } from "next/document";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { initializeAnalaytics, logPageView } from "@utils/analytics";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  initializeAnalaytics();
  useEffect(() => {
    router.events.on("routeChangeComplete", logPageView);
    return () => {
      router.events.off("routeChangeComplete", logPageView);
    };
  }, [router.events]);
  return (
    <SiteLayout>
      <Component {...pageProps} />
    </SiteLayout>
  );
}

export default MyApp;
