import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { PostDocument } from "@utils/documents";
import { GetStaticProps } from "next";
import React, { PropsWithChildren } from "react";

function TravelPosts(props: PropsWithChildren<{ posts: PostDocument[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}
export const getStaticProps: GetStaticProps = async (context) => {
  const { getDocuments } = await import("@quiescent/server");
  return {
    props: { posts: await getDocuments("posts", "dynamic", "travel") },
  };
};

export default TravelPosts;
