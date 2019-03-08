import React from "react";
import { withSiteData } from "react-static";

export default withSiteData(({ title, posts }: { title: string, posts: any }) => (
  <div style={{ textAlign: 'center' }}>
    <h1>
      {title}
    </h1>
    {posts.map((post: any) => <div key={post.id}>{post.id}</div>)}
  </div>
))
