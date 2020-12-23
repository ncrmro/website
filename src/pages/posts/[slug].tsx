import PageLayout from "@components/PageLayout";
import { Post, getContent } from "@utils/markdown";
import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";

const PostPage: React.FC<Post> = (props) => {
  return (
    <PageLayout>
      <div className="relative py-16 bg-white overflow-hidden">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-lg max-w-prose mx-auto">
            <h1>
              <span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase">
                {props.title}
              </span>
            </h1>
          </div>
          <div>{getContent(props.content)}</div>
        </div>
      </div>
    </PageLayout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const fs = require("fs");

  const post = require("@utils/markdown")
    .getPosts(fs)
    .reverse()
    .find((post) => post.slug === context.params.slug);

  return {
    props: { ...post, content: post.body },
  };
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  const fs = require("fs");
  return {
    paths: require("@utils/markdown")
      .getPosts(fs)
      .map((post) => ({
        params: post,
      })),
    fallback: false,
  };
};

export default PostPage;
