import PostRoute from "@routes/Post";
import { PostDocument } from "@utils/documents";
import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";

const PostPage: React.FC<{ post: PostDocument }> = (props) => {
  return <PostRoute {...props.post} />;
};

export const getStaticProps: GetStaticProps<{ post: PostDocument }> = async (
  context
) => {
  const { documentBySlug } = await import("@quiescent/server");
  if (typeof context.params.slug === "string") {
    return {
      props: { post: await documentBySlug("posts", context.params.slug) },
    };
  }
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  // Importing server code
  const { getDocumentSlugs } = await import("@quiescent/server");

  return {
    paths: (await getDocumentSlugs("posts", "dynamic")).map((slug) => ({
      params: {
        slug,
      },
    })),
    fallback: "blocking",
  };
};

export default PostPage;
