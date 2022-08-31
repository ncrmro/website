import { PropsWithChildren } from "react";
import { GetStaticProps } from "next";
import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { Post } from "../types";
import { getDocuments } from "@quiescent/server";

function Home(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { getDocuments } = await import("@quiescent/server");
  const posts = await getDocuments<Post>("posts", "dynamic");
  return {
    props: { posts: posts.filter((p) => p.state === "published") },
  };
};

export default Home;
