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
  return {
    props: { posts: require("@utils/markdown").getPosts(["food"]) },
  };
};

export default FoodPosts;
