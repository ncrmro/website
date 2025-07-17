"use client";
import Script from "next/script";

interface Umami {
  identify: (userId: string, userData?: Record<string, unknown>) => void;
  track: (eventName: string, eventData?: Record<string, unknown>) => void;
  trackView: (url?: string) => void;
}

declare global {
  interface Window {
    umami: Umami;
  }
  const umami: Umami;
}

export default function UmamiAnalytics(props: {
  scriptUrl: string;
  websiteId: string;
  domains?: string[];
}) {
  return (
    <Script
      src={props.scriptUrl}
      data-website-id={props.websiteId}
      data-domains={props.domains?.join(",")}
    />
  );
}
