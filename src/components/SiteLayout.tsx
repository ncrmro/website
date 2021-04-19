import GithubIcon from "@components/Icons/Github";
import InstagramIcon from "@components/Icons/Instagram";
import LinkedinIcon from "@components/Icons/Linkedin";
import TwitterIcon from "@components/Icons/Twitter";
import routes from "@router";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

// const SocialLinkWings: React.FC<{ isHome: boolean }> = (props) => {
//   const iconClassName = "fill-current text-gray-300";
//
//   return (
//     <div>
//       {props.isHome && (
//
//       )}
//       {props.children}
//       {props.isHome && (
//         <div className="flex space-x-3 place-self-center px-2"></div>
//       )}
//     </div>
//   );
// };

const iconClassName = "fill-current text-gray-300";

const Nav: React.FC = () => {
  const router = useRouter();
  const isHome = router.pathname === "/";
  return (
    <nav className="flex mx-auto" style={{ gridArea: "nav" }}>
      <div>
        <div className="flex justify-center">
          <div className="border-b py-2">
            <Link {...routes.landing}>
              <a className="text-gray-500 uppercase">
                {isHome ? "Nicholas Romero" : "Home"}
              </a>
            </Link>
          </div>
        </div>
        {isHome && (
          <div className="flex space-x-3 justify-center text-gray-400 py-2">
            <Link {...routes.posts.technology}>
              <a className="uppercase">Tech</a>
            </Link>
            <Link {...routes.about}>
              <a className="uppercase">About</a>
            </Link>
            <Link {...routes.about}>
              <a className="uppercase">Travel</a>
            </Link>
            <Link {...routes.about}>
              <a className="uppercase">Food</a>
            </Link>
          </div>
        )}
        {isHome && (
          <div className="flex space-x-3 justify-center px-2">
            <a href="https://www.linkedin.com/in/ncrmro/">
              <LinkedinIcon className={iconClassName} />
            </a>
            <a href="https://github.com/ncrmro">
              <GithubIcon className={iconClassName} />
            </a>
            <a href="https://twitter.com/ncrmro">
              <TwitterIcon className={iconClassName} />
            </a>
            <a href="https://www.instagram.com/ncrmro">
              <InstagramIcon className={iconClassName} />
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

const SiteLayout: React.FC = ({ children }) => (
  <div
    className="grid h-full"
    style={{
      gridTemplateAreas: "'nav' 'main' 'footer'",
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
