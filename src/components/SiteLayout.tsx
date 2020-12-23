import Link from "next/link";
import React from "react";

const notMobile = "'nav main' 'footer main'";
const mobile = "'nav' 'main' 'footer'";

const Nav = React.memo(() => (
  <nav
    className="bg-white border-b border-gray-200 h-16 mx-auto px-4 grid"
    style={{ gridArea: "nav" }}
  >
    <Link href="/">
      <a className="place-self-center">NCRMRO</a>
    </Link>
  </nav>
));

const SiteLayout: React.FC = ({ children }) => (
  <div
    className="grid"
    style={{
      gridTemplateAreas: mobile,
    }}
  >
    <Nav />
    <main style={{ gridArea: "main" }}>{children}</main>
    <footer style={{ gridArea: "footer" }}>Footah</footer>
  </div>
);

export default SiteLayout;
