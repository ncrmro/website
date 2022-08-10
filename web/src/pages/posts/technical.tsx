import PageLayout from "../../components/PageLayout";
import Posts from "../../components/Posts";
import { getDocuments } from '@quiescent/server'
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
    props: { posts: await getDocuments("posts", "dynamic", "technical") },
  };
};
export default TechnologyPosts;
