import { Post } from "./types";
import Link from "next/link";
import PageLayout from "@components/PageLayout";
// import { Card, CardContent, CardHeader } from "@components/Card";
import { usePrettyDate } from "./hooks";

export const PostsRoute: React.FC<{ posts: Post[] }> = (props) => {
  return (
    <PageLayout title="Posts">
      <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
        {props.posts.map((post) => (
          <div key={post.slug}> test</div>
        ))}
      </div>
    </PageLayout>
  );
};
