import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { Post } from "@utils/getPosts";
import React, { PropsWithChildren } from "react";
import { GetStaticProps } from "next";

function FoodPosts(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}
export const getStaticProps: GetStaticProps = async (context) => {
  const posts = Object.values<Post>(
    await require("@utils/getPosts").default("food")
  );
  posts.sort((a, b) => b.date - a.date);

  return {
    props: { posts },
  };
};

export default FoodPosts;
