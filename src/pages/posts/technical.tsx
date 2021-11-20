import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { Post } from "@utils/getPosts";
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
  const posts = Object.values(
    await require("@utils/getPosts").default("technical")
  );
  posts.sort((a, b) => b.date - a.date);
  return {
    props: {
      posts,
    },
  };
};

export default TechnologyPosts;
