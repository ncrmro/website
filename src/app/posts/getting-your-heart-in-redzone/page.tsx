import StaticRedirect from "@/components/StaticRedirect";

export default function LegacyPostRedirectPage() {
  return (
    <StaticRedirect
      href="/posts/vo2-max-training-with-apple-watch"
      message="This post moved."
    />
  );
}
