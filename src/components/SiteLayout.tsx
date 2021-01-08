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
      <div className="flex space-x-2 items-center border-b py-2 justify-self-center ">
        <Link href="/">
          <a className="place-self-center text-gray-500 uppercase">
            {isHome ? "Nicholas Romero" : "Home"}
          </a>
        </Link>
      </div>
      {isHome ? (
        <div className="flex justify-self-center space-x-3 text-gray-400 pt-2">
          <a href="https://www.linkedin.com/in/ncrmro/">
            <LinkedinIcon className={iconClassName} />
          </a>
          <a href="https://github.com/ncrmro">
            <GithubIcon className={iconClassName} />
          </a>
          <Link href="/about">
            <a className="uppercase">About</a>
          </Link>
          {/*<Link href="/about">*/}
          {/*  <a>Travel</a>*/}
          {/*</Link>*/}
          {/*<Link href="/about">*/}
          {/*  <a>Music</a>*/}
          {/*</Link>*/}
          {/*<Link href="/about">*/}
          {/*  <a>Tech</a>*/}
          {/*</Link>*/}
          <a href="https://twitter.com/ncrmro">
            <TwitterIcon className={iconClassName} />
          </a>
          <a href="https://www.instagram.com/ncrmro">
            <InstagramIcon className={iconClassName} />
          </a>
        </div>
      ) : null}
    </nav>
  );
};

const SiteLayout: React.FC = ({ children }) => (
  <div
    className="grid h-full"
    style={{
      gridTemplateAreas: mobile,
      gridTemplateRows: "auto 1fr auto",
    }}
  >
    <Nav />
    <main
      className="grid place-self-center w-full h-full"
      style={{ gridArea: "main" }}
    >
      {children}
    </main>
    <footer
      className="flex justify-self-center m-3 pb-3"
      style={{ gridArea: "footer" }}
    >
      Nicholas Romero
    </footer>
  </div>
);

export default SiteLayout;
