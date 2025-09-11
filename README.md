This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This is a mirror repository now, the source is on my personal Gitea instance

## Blog Post Sync

This project includes a blog post sync feature that allows you to sync blog posts between your local Obsidian directory and the website database. See [BLOG_SYNC.md](./BLOG_SYNC.md) for detailed usage instructions.

Quick start:
```bash
# Download all posts as Obsidian markdown files
npm run sync-posts

# Push local Obsidian posts to the server
npm run sync-posts -- --push
```


## Getting Started

You will need to have [netlify CLI](https://docs.netlify.com/cli/get-started/#authentication) installed and have LFS set up as this is how
media assets are saved to the repo. 

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
