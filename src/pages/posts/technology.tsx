import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { Post } from "@utils/markdown";
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
  return {
    props: { posts: require("@utils/markdown").getPosts(["tech"]) },
  };
};

export default TechnologyPosts;
