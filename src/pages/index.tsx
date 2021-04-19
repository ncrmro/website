import { PropsWithChildren } from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { Post } from "@utils/markdown";

function Home(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <PageLayout className="p-6">
      <Head>
        <title>Nicholas Romero</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const fs = require("fs");
  const posts = require("@utils/markdown").getPosts(fs);

  return {
    props: { posts },
  };
};

export default Home;
