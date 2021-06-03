export const routes = {
  landing: {
    href: "/",
  },
  about: {
    href: "/about",
  },
  resume: {
    href: "/resume",
  },
  posts: {
    post: ({ slug }: { slug: string }) => ({
      href: { pathname: "/posts/[slug]", query: { slug } },
    }),
    technology: {
      href: "/posts/technology",
    },
    travel: {
      href: "/posts/travel",
    },
    food: {
      href: "/posts/food",
    },
  },
};

export default routes;
