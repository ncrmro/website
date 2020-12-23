import { getContent, getMetadata, getPosts, Post } from "@utils/markdown";
import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";

const PostPage: React.FC = (props) => {
  return getContent(props.body);
};

export const getStaticProps: GetStaticProps = async (context) => {
  const fs = require("fs");
  const post = require("@utils/markdown")
    .getPosts(fs)
    .reverse()
    .find((post) => post.slug === context.params.slug);

  return {
    props: post,
  };
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  const fs = require("fs");
  return {
    paths: require("@utils/markdown")
      .getPosts(fs)
      .map((post) => ({
        params: post,
      })),
    fallback: false,
  };
};

export default PostPage;
