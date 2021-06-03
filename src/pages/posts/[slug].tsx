import MarkdownRenderer from "@components/MarkdownRenderer";
import PageLayout from "@components/PageLayout";
import { Post } from "@utils/markdown";
import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";

const PostPage: React.FC<Post> = (props) => {
  return (
    <PageLayout
      title={props.title}
      className="relative py-4 bg-white overflow-hidden max-w-6xl	"
    >
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="text-lg max-w-prose mx-auto">
          <h1>
            <span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase pb-6">
              {props.title}
            </span>
          </h1>
        </div>
        <div className="flex flex-col space-y-3 text-base max-w-prose mx-auto lg:max-w-none">
          <MarkdownRenderer content={props.content} />
        </div>
      </div>
    </PageLayout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const post = require("@utils/markdown")
    .getPosts()
    .reverse()
    .find((post) => post.slug === context.params.slug);

  return {
    props: { ...post, content: post.body },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: await require("@utils/markdown")
      .getPosts()
      .map((post) => ({
        params: post,
      })),
    fallback: false,
  };
};

export default PostPage;
