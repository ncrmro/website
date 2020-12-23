import GithubIcon from "@components/Icons/Github";
import InstagramIcon from "@components/Icons/Instagram";
import LinkedinIcon from "@components/Icons/Linkedin";
import TwitterIcon from "@components/Icons/Twitter";
import PageLayout from "@components/PageLayout";
import { Post } from "@utils/markdown";
import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const PostCard: React.FC<Post> = (props) => (
  <div className="flex-1 bg-white p-6 flex flex-col justify-between">
    <div className="flex-1">
      <Link href={`/posts/${props.slug}`}>
        <a href="#" className="block mt-2">
          <p className="text-xl font-semibold text-gray-900">{props.title}</p>
          <p className="mt-3 text-base text-gray-500">{props.description}</p>
        </a>
      </Link>
    </div>
    {/*<div className="mt-6 flex items-center">*/}
    {/*  <div className="ml-3">*/}
    {/*    <div className="flex space-x-1 text-sm text-gray-500">*/}
    {/*      <time dateTime="2020-03-16">Mar 16, 2020</time>*/}
    {/*      <span aria-hidden="true">&middot;</span>*/}
    {/*      <span>6 min read</span>*/}
    {/*    </div>*/}
    {/*  </div>*/}
    {/*</div>*/}
  </div>
);

function Home(props) {
  return (
    <PageLayout>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="grid w-full">
        {/*<div className="flex">*/}
        {/*  <Image*/}
        {/*    src="/images/avatar.jpg"*/}
        {/*    alt="Picture of the author"*/}
        {/*    width={50}*/}
        {/*    height={50}*/}
        {/*    className="object-cover shadow-lg rounded-lg"*/}
        {/*  />*/}
        {/*  <h1 className="">Nicholas Romero</h1>*/}
        {/*  <br />*/}
        {/*</div>*/}

        {props.posts.reverse().map((post) => (
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
