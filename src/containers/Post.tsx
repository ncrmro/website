import React from 'react'
import { withRouteData } from 'react-static'
import { Link } from '@reach/router'
import { Post } from '../types'
import ReactMarkdown from "react-markdown"

export default withRouteData(({ post }: { post: Post }) => (
    <div>
        <Link to="/blog/">{'<'} Back</Link>
        <ReactMarkdown source={post.body}/>
    </div>
))
