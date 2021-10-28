import React, { PropsWithChildren } from "react";
import Link from "next/link";
import routes from "@router";
import { Post } from "@utils/markdown";
import styles from "./Posts.module.css";

function PostCard(props) {
  return (
    <Link {...routes.posts.post({ slug: props.slug })}>
      <a className={styles.post}>
        <p>{props.title}</p>
        <p>{props.description}</p>
      </a>
    </Link>
  );
}

export default function Posts(props: PropsWithChildren<{ posts: Post[] }>) {
  return (
    <div className={styles.root}>
      {props.posts.length > 0 ? (
        props.posts.map((post) => <PostCard key={post.slug} {...post} />)
      ) : (
        <div>No posts :(</div>
      )}
    </div>
  );
}
