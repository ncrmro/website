import SEO, { SEOProps } from "@components/SEO";
import React from "react";

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
  let id = "layout";
  if (props.id) {
    id = props.id;
  } else if (props.title) {
    id = props.title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }
  id = `${id}-page`;
  return (
    <div
      id={id}
      className={`container mx-auto min-h-full mt-4 p-3 ${
        props.className ?? ""
      }`}
    >
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
