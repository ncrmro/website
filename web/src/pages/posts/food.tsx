import PageLayout from "../../components/PageLayout";
import Posts from "../../components/Posts";
import React, { PropsWithChildren } from "react";
import { GetStaticProps } from "next";
import { Post } from '../../types'

function TechnologyPosts(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}
export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: { posts: [], }
  };
};

export default TechnologyPosts;
