import { Link } from "@reach/router";
import React from "react";
import { withSiteData } from "react-static";

export default withSiteData(
  ({ title, posts }: { title: string; posts: any }) => (
    <div style={{ textAlign: 'center' }}>
      <h1>{title}</h1>
      <ul>
        {posts.map((post: any) => (
          <li key={post.id} className="post_link">
            <Link to={`/posts/${post.id}`}>{post.title}</Link> - {post.datePosted}
            <br/>
            {post.description}
          </li>
        ))}
      </ul>
    </div>
  ),
)
