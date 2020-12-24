import "tailwindcss/tailwind.css";
import SiteLayout from "@components/SiteLayout";
import { initializeAnalaytics } from "@utils/analytics";

function MyApp({ Component, pageProps }) {
  initializeAnalaytics();
  return (
    <SiteLayout>
      <Component {...pageProps} />
    </SiteLayout>
  );
}

export default MyApp;
