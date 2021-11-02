import GithubIcon from "@components/Icons/Github";
import InstagramIcon from "@components/Icons/Instagram";
import LinkedinIcon from "@components/Icons/Linkedin";
import TwitterIcon from "@components/Icons/Twitter";
import routes from "@router";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import styles from "./SiteLayout.module.css";

const iconClassName = "fill-current text-gray-300";

const Nav: React.FC = () => {
  const router = useRouter();
  const isHome = router.pathname === "/";
  return (
    <nav className={styles.navbar}>
      <Link {...routes.landing}>
        <a className={styles.navTitle}>{isHome ? "Nicholas Romero" : "Home"}</a>
      </Link>
      {isHome && (
        <div className={styles.homeLinks}>
          <Link {...routes.posts.technology}>Tech</Link>
          <Link {...routes.about}>About</Link>
          <Link {...routes.posts.travel}>Travel</Link>
          <Link {...routes.posts.food}>Food</Link>
          <Link {...routes.resume}>Resume</Link>
        </div>
      )}
      {isHome && (
        <div className={styles.iconLinks}>
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
    </nav>
  );
};

const SiteLayout: React.FC = ({ children }) => (
  <>
    <Head>
      <title>Nicholas Romero</title>
      <link rel="icon" href="/favicon.png" />
    </Head>
    <Nav />
    <main className={styles.main}>{children}</main>
    <footer className={styles.footer}>Nicholas Romero</footer>
  </>
);

export default SiteLayout;
