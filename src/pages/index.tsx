import React from 'react'
import { withSiteData } from 'react-static'
import { Link } from '@reach/router'

export default withSiteData(
  ({ title, posts }: { title: string; posts: any }) => (
    <div style={{ textAlign: 'center' }}>
      <h1>{title}</h1>
      {posts.map((post: any) => (
        <Link key={post.id} to={`/blog/post/${post.id}/`}>
          {post.title}
        </Link>
      ))}
    </div>
  ),
)
