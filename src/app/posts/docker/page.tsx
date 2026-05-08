import StaticRedirect from "@/components/StaticRedirect";

export default function LegacyPostRedirectPage() {
  return (
    <StaticRedirect
      href="/posts/docker-linux-workstation-development"
      message="This post moved."
    />
  );
}
