import PostRoute from "@routes/Post";
import { Post } from "@utils/getPosts";
import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";

const PostPage: React.FC<Post> = (props) => {
  // return <PostRoute {...props} />;
  return <div>console.log</div>;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const post = await import("@utils/getPosts").then((p) =>
    p.postBySlug(context.params.slug as string)
  );
  return {
    props: { ...post },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await import("@utils/getPosts").then((p) => p.postSlugs());

  return {
    paths: slugs.map((slug) => ({
      params: { slug },
    })),
    fallback: false,
  };
};

export default PostPage;
