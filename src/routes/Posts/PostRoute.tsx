import { MDXPost } from "@routes/Posts/types";
import PageLayout from "@components/PageLayout";
import { Property } from "csstype";
import { MDXRemote } from "next-mdx-remote";
import styles from "./Post.module.css";
import { usePrettyDate } from "@routes/Posts/hooks";
import React, { ReactElement } from "react";
import { default as NextImage } from "next/image";
import ObjectFit = Property.ObjectFit;

function Image({
  post,
  height = "500px",
  width = "500px",
  objectFit = "contain",
  ...props
}): ReactElement {
  return (
    <NextImage
      {...props}
      height={height}
      width={width}
      objectFit={objectFit as ObjectFit}
      src={`/posts/${post.date.replaceAll("-", "_")}_${post.slug}/media/${
        props.src
      }`}
    />
  );
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
            Image: (p) => (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Image {...p} post={props.post} />
              </div>
            ),
          }}
        />
      </div>
    </PageLayout>
  );
}
