import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { Post } from "@utils/getPosts";
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
  const posts = Object.values(
    await require("@utils/getPosts").default("travel")
  );
  posts.sort((a, b) => b.date - a.date);
  return {
    props: {
      posts,
    },
  };
};

export default TravelPosts;
