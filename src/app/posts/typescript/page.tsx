import StaticRedirect from "@/components/StaticRedirect";

export default function LegacyPostRedirectPage() {
  return (
    <StaticRedirect
      href="/posts/typescript-enum-form-stepper"
      message="This post moved."
    />
  );
}
