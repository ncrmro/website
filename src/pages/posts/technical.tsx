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
  const posts = await import("@utils/getPosts").then((p) =>
    p.orderedPostsArray(PostCategory.technical)
  );
  return {
    props: {
      posts,
    },
  };
};

export default TechnologyPosts;
