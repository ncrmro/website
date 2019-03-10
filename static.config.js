import path from 'path'
import fs from 'fs'
import React, {Component} from "react";
import extractMarkdownMetaData from "./src/markdownExtractor"

require('dotenv').config()

function readStaticMarkdown() {
  const dir = './public/posts/'
  const posts = []
  const files = fs.readdirSync(dir)
    for (const file of files) {
        const fileContent = fs.readFileSync( dir + file, { encoding: 'utf8' } );
        const { markdown, metadata } = extractMarkdownMetaData( fileContent );
    posts.push(
        {
            id: file.replace('.md', ''),
            fileName: file,
            'body': markdown,
            ...metadata
        }
    )
  }
    posts.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.

        return new Date(b.datePosted) - new Date(a.datePosted);
    });
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
