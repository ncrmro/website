import StaticRedirect from "@/components/StaticRedirect";

export default function LegacyPostRedirectPage() {
  return (
    <StaticRedirect
      href="/posts/summertime-adventure-new-orleans"
      message="This post moved."
    />
  );
}
