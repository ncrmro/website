import { Posts } from "@/app/posts/page";

export default async function Home() {
  const posts = await Posts();
  return <>{posts}</>;
}
