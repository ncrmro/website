import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import { Link } from 'gatsby'

const Posts = (props) => {
  const Posts = props.data.allMarkdownRemark.edges
    .filter((edge) => !!edge.node.frontmatter.date) // You can filter your posts based on some criteria
    .map((edge) => (
      <Link key={edge.node.id} to={edge.node.frontmatter.slug}>
        <h3>{edge.node.frontmatter.title}</h3>
        <p>{edge.node.frontmatter.description}</p>
      </Link>
    ))

  return <div>{Posts}</div>
}

export default function PostsContainer(props) {
  return (
    <StaticQuery
      query={graphql`
        query {
          allMarkdownRemark(
            sort: { order: DESC, fields: [frontmatter___date] }
          ) {
            edges {
              node {
                id
                excerpt(pruneLength: 250)
                frontmatter {
                  date(formatString: "MMMM DD, YYYY")
                  description
                  slug
                  title
                }
              }
            }
          }
        }
      `}
      render={(data) => <Posts data={data} {...props} />}
    />
  )
}
