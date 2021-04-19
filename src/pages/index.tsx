import React from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import PageLayout from "@components/PageLayout";
import { Post } from "@utils/markdown";


function Home(props) {
  return (
    <PageLayout className="p-6">
      <Head>
        <title>Nicholas Romero</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <div className="grid w-full gap-12">
        {props.posts.map((post) => (
          <PostCard key={post.slug} {...post} />
        ))}
      </div>
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
