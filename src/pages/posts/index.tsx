import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { getMetadata } from "@utils/markdown";

const PostsPage: React.FC = (props) => {
  return <div>posts</div>;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const fs = require("fs");

  console.log("AYEEE", context);
  return {
    props: {},
  };
};

export default PostsPage;
