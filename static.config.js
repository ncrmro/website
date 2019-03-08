import axios from 'axios'
import path from 'path'
import fs from 'fs'

function readStaticMarkdown() {
  const dir = './public/posts/'
  const posts = []
  const files = fs.readdirSync(dir)
  for (const file of files) {
    posts.push(
        {
          'id': file.replace('.md', ''),
          'title': file.replace('.md', ''),
          'body': fs.readFileSync(dir + file, {encoding: 'utf8'})
        }
    )
  }
  return posts
}

export default {
  plugins: ['react-static-plugin-typescript'],
  entry: path.join(__dirname, 'src', 'index.tsx'),
  getSiteData: () => ({
    title: 'NCRMRO',
  }),
  getRoutes: async () => {
    const posts = readStaticMarkdown();
    return [
      {
        path: '/blog',
        getData: () => ({ posts } ),
        children: posts.map(post => ({
          path: `/post/${post.id}`,
          component: 'src/containers/Post',
          getData: () => ({
            post,
          }),
        })),
      },
    ]
  },
}
