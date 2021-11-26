import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { Post, PostCategory } from "@utils/getPosts";
import { GetStaticProps } from "next";
import React, { PropsWithChildren } from "react";

function TravelPosts(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}
export const getStaticProps: GetStaticProps = async (context) => {
  const posts = await import("@utils/getPosts").then((p) =>
    p.orderedPostsArray(PostCategory.travel)
  );
  return {
    props: {
      posts,
    },
  };
};

export default TravelPosts;
