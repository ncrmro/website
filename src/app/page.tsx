import { Posts } from "@/app/posts/page";

export default async function Home() {
  const posts = await Posts();
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      {posts}
    </main>
  );
}
