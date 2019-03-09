import { Link } from '@reach/router'
import axios from 'axios'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { withRouteData } from 'react-static'
import { PostType } from '../types'

class Post extends React.Component<any, PostType> {
  constructor(props: { post: PostType }) {
    super(props)
    this.state = { ...props.post }
  }

  componentDidMount() {
    axios.get(`/posts/${this.state.fileName}`).then((res: any) => {
      const content = res.data
      this.setState({ body: content })
    })
  }

  public render(): JSX.Element {
    return (
      <div>
        <Link to="/blog/">{'<'} Back</Link>
        <ReactMarkdown source={this.state.body} />
      </div>
    )
  }
}

export default withRouteData(Post)
