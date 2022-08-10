import { MDXPost } from "./types";
import PageLayout from "../../components/PageLayout";
import { MDXRemote } from "next-mdx-remote";
import styles from "./Post.module.css";
import { usePrettyDate } from "./hooks";
import React from "react";

const components = {};

export function PostRoute(props: { post: MDXPost }) {
  const date = usePrettyDate(props.post.date);

  return (
    <PageLayout title={props.post.title}>
      <div className={styles.postRoute}>
        <div className={styles.postRouteHeader}>
          <span>
            <h1>{props.post.title}</h1>
          </span>
          <span>{date}</span>
        </div>
        <MDXRemote {...props.post.content} components={components} />
      </div>
    </PageLayout>
  );
}
