import { MDXPost } from "@routes/Posts/types";
import PageLayout from "@components/PageLayout";
import { MDXRemote } from "next-mdx-remote";
import styles from "./Post.module.css";
import { usePrettyDate } from "@routes/Posts/hooks";
import React, { ReactElement } from "react";
import Image from "next/image";

function getMediaPath(post: MDXPost, fileName) {
  return `/posts/${post.date.replaceAll("-", "_")}_${
    post.slug
  }/media/${fileName}`;
}

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
        <MDXRemote
          {...props.post.content}
          components={{
            Image: ({ height = "500px", width = "500px", ...imgProps }) => (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Image
                  {...props}
                  height={height}
                  width={width}
                  // layout="fill"
                  objectFit="contain"
                  src={getMediaPath(props.post, imgProps.src)}
                />
              </div>
            ),
          }}
        />
      </div>
    </PageLayout>
  );
}
