import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { Post, PostCategory } from "@utils/getPosts";
import React, { PropsWithChildren } from "react";
import { GetStaticProps } from "next";

function TechnologyPosts(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}
export const getStaticProps: GetStaticProps = async (context) => {
  const { getDocuments } = await import("@quiescent/server");
  return {
    props: { posts: [] },
  };
};
export default TechnologyPosts;
