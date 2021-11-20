import PostRoute from "@routes/Post";
import { Post } from "@utils/getPosts";
import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";

const PostPage: React.FC<Post> = (props) => {
  return <PostRoute {...props} />;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const posts = await require("@utils/getPosts").default();
  const post = posts[context.params.slug as string];
  return {
    props: { ...post, content: post.body },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: Object.keys(await require("@utils/getPosts").default()).map(
      (slug) => ({ params: { slug } })
    ),
    fallback: false,
  };
};

export default PostPage;
