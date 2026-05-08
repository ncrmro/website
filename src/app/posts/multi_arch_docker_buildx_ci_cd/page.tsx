import StaticRedirect from "@/components/StaticRedirect";

export default function LegacyMultiArchRedirectPage() {
  return (
    <StaticRedirect
      href="/posts/multi-arch-docker-buildx-ci-cd"
      message="This post moved."
    />
  );
}
