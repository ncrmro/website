import { getDocumentBySlug } from "@quiescent/server";
import { PostRoute } from "@routes/Posts/PostRoute";
import React from "react";
import { GetStaticProps } from "next";
import { serialize } from "next-mdx-remote/serialize";
import { MDXPost, Post } from "../../types";

const PostPage: React.FC<{ post: MDXPost }> = (props) => {
  return <PostRoute post={props.post} />;
};

export const getServerSideProps: GetStaticProps<{ post: MDXPost }> = async (
  context
) => {
  if (typeof context.params?.slug !== "string") throw "Slug was not defined";
  const post = await getDocumentBySlug<Post>("posts", context.params.slug);
  if (!post) throw "Error loading post";

  return {
    props: { post: { ...post, content: await serialize(post.content) } },
  };
};

export default PostPage;
