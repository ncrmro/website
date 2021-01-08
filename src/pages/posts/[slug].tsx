import CodeBlock from "@components/CodeBlock";
import PageLayout from "@components/PageLayout";
import { Post } from "@utils/markdown";
import slugify from "@utils/slugify";
import { Language } from "prism-react-renderer";
import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { Remark } from "react-remark";

const PostPage: React.FC<Post> = (props) => {
  return (
    <PageLayout title={props.title} className="relative py-4 bg-white overflow-hidden max-w-6xl	">
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-lg max-w-prose mx-auto">
            <h1>
              <span className="block text-base text-center text-indigo-600 font-semibold tracking-wide uppercase pb-6">
                {props.title}
              </span>
            </h1>
          </div>
          <div className="flex flex-col space-y-3 text-base max-w-prose mx-auto lg:max-w-none">
            <Remark
              rehypeReactOptions={{
                components: {
                  pre: (props) => {
                    const className: string =
                      props.children[0].props?.className;
                    if (className && className.includes("language-")) {
                      let language = className.replace("language-", "");
                      const code = props.children[0].props.children[0];
                      if (language === "typescript") {
                        language = "jsx";
                      }

                      return (
                        <CodeBlock
                          code={code}
                          language={language as Language}
                        />
                      );
                    }

                    return <pre>{props.children}</pre>;
                  },
                  h2: (props) => (
                    <h2
                      id={slugify(props.children[0])}
                      className="font-semibold text-2xl pt-4"
                    >
                      {props.children}
                    </h2>
                  ),
                  h3: (props) => (
                    <h3
                      id={slugify(props.children[0])}
                      className="font-semibold text-xl  pt-4"
                    >
                      {props.children}
                    </h3>
                  ),
                  // img: (props) => (
                  //   <Image
                  //     className=" flex justify-centermax-w-xs max-h-xs"
                  //     height={200}
                  //     width={400}
                  //     src={props.src as string}
                  //     alt={props.alt as string}
                  //   />
                  // ),
                  a: (props: { href; children }) => (
                    <a
                      className="text-indigo-600 hover:text-indigo-500"
                      href={props.href}
                    >
                      {props.children}
                    </a>
                  ),
                  p: (props) => {
                    console.log(props);
                    return (
                      <div className="">
                        <p className="">{props.children}</p>
                      </div>
                    );
                  },
                  ul: (props) => (
                    <ul className="list-disc list-inside">{props.children}</ul>
                  ),
                },
              }}
            >
              {props.content}
            </Remark>
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

export const getStaticPaths: GetStaticPaths = async () => {
  const fs = require("fs");
  return {
    paths: await require("@utils/markdown")
      .getPosts(fs)
      .map((post) => ({
        params: post,
      })),
    fallback: false,
  };
};

export default PostPage;
