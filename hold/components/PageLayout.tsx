import SEO, { SEOProps } from "@components/SEO";
import React from "react";
import styles from "./PageLayout.module.css";

interface Props extends SEOProps {
  id?: string;
  title?: string;
  className?: string;
  children;
}

/**
 * The PageLayout component provides a singular way to manage out page sizine
 */
const PageLayout: React.FC<Props> = (props) => {
  return (
    <div className={styles.root}>
      <SEO
        title={props.title}
        description={props.description}
        image={props.image}
        path={props.path}
        article={props.article}
        articleTags={props.articleTags}
      />
      {props.children}
    </div>
  );
};

export default PageLayout;
