import { PropsWithChildren } from "react";
import { GetStaticProps } from "next";
import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { orderedPostsArray, Post } from "@utils/getPosts";

function Home(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const posts = await import("@utils/getPosts").then((p) =>
    p.orderedPostsArray()
  );

  return {
    props: { posts: posts },
  };
};

export default Home;
