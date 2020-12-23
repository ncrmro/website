import GithubIcon from "@components/Icons/Github";
import InstagramIcon from "@components/Icons/Instagram";
import LinkedinIcon from "@components/Icons/Linkedin";
import TwitterIcon from "@components/Icons/Twitter";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const notMobile = "'nav main' 'footer main'";
const mobile = "'nav' 'main' 'footer'";

const Nav = () => {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const iconClassName = "fill-current text-gray-300";
  return (
    <nav
      className="bg-white border-gray-200 h-16 mx-auto px-4 grid items-center py-2"
      style={{ gridArea: "nav" }}
    >
      <div className="flex space-x-2 items-center border-b py-2">
        <a href="https://www.linkedin.com/in/ncrmro/">
          <LinkedinIcon className={iconClassName} />
        </a>
        <a href="https://github.com/ncrmro">
          <GithubIcon className={iconClassName} />
        </a>
        <Link href="/">
          <a className="place-self-center">NCRMRO</a>
        </Link>
        <a href="https://twitter.com/ncrmro">
          <TwitterIcon className={iconClassName} />
        </a>
        <a href="https://www.instagram.com/ncrmro">
          <InstagramIcon className={iconClassName} />
        </a>
      </div>
      <div className="flex space-x-2 text-gray-400">
        <Link href="/about">
          <a>About</a>
        </Link>
        <Link href="/about">
          <a>Travel</a>
        </Link>
        <Link href="/about">
          <a>Music</a>
        </Link>
        <Link href="/about">
          <a>Tech</a>
        </Link>
      </div>
    </nav>
  );
};

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
