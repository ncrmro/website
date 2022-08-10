import PageLayout from "@components/PageLayout";
import Posts from "@components/Posts";
import { getDocuments } from '@quiescent/server'
import { GetStaticProps } from "next";
import React, { PropsWithChildren } from "react";
import { Post } from '../../types'

function TravelPosts(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <PageLayout>
      <Posts posts={props.posts} />
    </PageLayout>
  );
}
export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: { posts: await getDocuments("posts", "dynamic", "travel") },
  };
};

export default TravelPosts;
