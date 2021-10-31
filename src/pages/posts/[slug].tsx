import PostRoute from "@routes/Post";
import { Post } from "@utils/markdown";
import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";

const PostPage: React.FC<Post> = (props) => {
  return <PostRoute {...props} />;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const post = require("@utils/markdown")
    .getPosts()
    .reverse()
    .find((post) => post.slug === context.params.slug);

  return {
    props: { ...post, content: post.body },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: await require("@utils/markdown")
      .getPosts()
      .map((post) => ({
        params: post,
      })),
    fallback: false,
  };
};

export default PostPage;
