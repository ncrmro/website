import { PropsWithChildren } from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { Post } from "@utils/markdown";

function Home(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: { posts: require("@utils/markdown").getPosts() },
  };
};

export default Home;
