import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { PostDocument } from "@utils/documents";
import React, { PropsWithChildren } from "react";
import { GetStaticProps } from "next";

function TechnologyPosts(props: PropsWithChildren<{ posts: PostDocument[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}
export const getStaticProps: GetStaticProps = async (context) => {
  const { getDocuments } = await import("@quiescent/server");
  return {
    props: { posts: await getDocuments("posts", "dynamic", "technical") },
  };
};
export default TechnologyPosts;
