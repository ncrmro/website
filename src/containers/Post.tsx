import axios from 'axios'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { withRouteData } from 'react-static'
import extractMarkdownMetaData from '../markdownExtractor'
import { PostType } from '../types'

class Post extends React.Component<any, PostType> {
  constructor(props: { post: PostType }) {
    super(props)
    this.state = { ...props.post }
  }

  componentDidMount() {
    axios.get(`/posts/${this.state.fileName}`).then((res: any) => {
      const { markdown, metadata } = extractMarkdownMetaData(res.data)
      this.setState({ body: markdown, metadata })
    })
  }

  public render(): JSX.Element {
    return (
      <div>
        <ReactMarkdown source={this.state.body} />
      </div>
    )
  }
}

export default withRouteData(Post)
