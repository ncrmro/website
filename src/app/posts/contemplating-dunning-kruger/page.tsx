import StaticRedirect from "@/components/StaticRedirect";

export default function LegacyPostRedirectPage() {
  return (
    <StaticRedirect
      href="/posts/contemplating-dunning-krugger"
      message="This post moved."
    />
  );
}
