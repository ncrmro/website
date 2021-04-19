import React from "react";
import Head from "next/head";

interface Props {
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
      className={`container mx-auto min-h-full mt-4 ${
        props.className ?? ""
      } p-6`}
    >
      {props.title && (
        <Head>
          <title>{props.title}</title>
        </Head>
      )}
      {props.children}
    </div>
  );
};

export default PageLayout;
