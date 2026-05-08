import StaticRedirect from "@/components/StaticRedirect";

export default function LegacyPostRedirectPage() {
  return (
    <StaticRedirect
      href="/posts/choosing-the-best-multi-os-setup"
      message="This post moved."
    />
  );
}
