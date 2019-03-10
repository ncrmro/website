import path from 'path'
import fs from 'fs'
import React, {Component} from "react";
import extractMarkdownMetaData from "markdownExtractor"

require('dotenv').config()

function readStaticMarkdown() {
  const dir = './public/posts/'
  const posts = []
  const files = fs.readdirSync(dir)
    for (let file of files) {
        file = fs.readFileSync( dir + file, { encoding: 'utf8' } );
        const { markdown, metadata } = extractMarkdownMetaData( file );
    posts.push(
        {
            id: file.replace('.md', ''),
            fileName: file,
            title: file.replace('.md', ''),
            'body': markdown,
            ...metadata
        }
    )
  }
  return posts
}

function setClientVariables() {
    const environment_variables = {
        client: true,
        SENTRY_DSN: process.env.SENTRY_DSN,
        ENVIRONMENT: process.env.ENVIRONMENT,
        COMMIT_REF: process.env.COMMIT_REF,
    }
    return `const process = ${JSON.stringify( { env: environment_variables } )}`
}


export default {
  plugins: ['react-static-plugin-typescript'],
    siteRoot: process.env.SITE_ROOT,
    entry: path.join( __dirname, 'src', 'index.tsx' ),
  getSiteData: () => ({
    title: 'NCRMRO', posts: readStaticMarkdown()
  }),
  getRoutes: async () => {
    const posts = readStaticMarkdown();
    return [
      {
        path: '/',
        getData: () => ({ posts } ),
        children: posts.map(post => ({
          path: `/posts/${post.id}`,
          component: 'src/containers/Post',
          getData: () => ({
            post,
          }),
        })),
      },
    ]
  },
    Document: class CustomHtml extends Component {
        render() {
            const { Html, Head, Body, children } = this.props;

            return (
                <Html>
                <Head>
                    <meta charSet="utf-8"/>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1"
                    />

                    <script dangerouslySetInnerHTML={{ __html: setClientVariables() }}/>
                </Head>
                <Body>
                {children}
                </Body>
                </Html>
            );
        }
    }
}
