export const GA_TRACKING_ID = process.env.GOOGLE_ANALYTICS_TRACKING_ID;

export const pageview = (url: string) => {
  console.log("pageview", url);
  if (url.includes("/dashboard")) return;
  // @ts-ignore
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value: string;
}) => {
  console.log("pageview", "event");
  // @ts-ignore
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
