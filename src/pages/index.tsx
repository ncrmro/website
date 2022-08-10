import { PropsWithChildren } from "react";
import { GetStaticProps } from "next";
import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { Post } from "../types";

function Home(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts.reverse()} />
    </PageLayout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { getDocuments } = await import("@quiescent/server");
  return {
    props: { posts: await getDocuments("posts", "dynamic") },
  };
};

export default Home;
