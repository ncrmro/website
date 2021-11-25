import MarkdownRenderer from "@components/MarkdownRenderer";
import PageLayout from "@components/PageLayout";
import { Post } from "@utils/getPosts";
import React from "react";
import styles from "./Post.module.css";

const PostRoute: React.FC<Post> = (props) => {
  return (
    <PageLayout
      title={props.title}
      path={`/posts/${props.slug}`}
      description={props.description}
      article
      articleTags={props.tags}
    >
      <div className={styles.root}>
        <h1>{props.title}</h1>
        <MarkdownRenderer content={props.body} mediaPath={props.mediaPath} />
      </div>
    </PageLayout>
  );
};

export default PostRoute;
