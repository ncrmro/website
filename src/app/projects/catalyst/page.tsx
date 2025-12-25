import ProjectLayout from "../ProjectLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalyst - Nicholas Romero",
  description:
    "Development platform to accelerate software development and deployment",
};

export default function CatalystPage() {
  return (
    <ProjectLayout
      title="Catalyst"
      description="GitHub ncrmro/catalyst"
      url="https://github.com/ncrmro/catalyst"
    >
      <p className="py-1">
        Catalyst is a development platform designed to accelerate software
        development and deployment. It provides opinionated deployments, CI/CD
        pipelines, and boilerplates to help you ship faster.
      </p>
      <p className="py-1">
        Development environments give users and agents full access to a
        Kubernetes namespace with a public URL—preview environments built in.
        This enables spec-driven development and seamless PR previews.
      </p>
      <p className="py-1">Core capabilities:</p>
      <ul className="list-disc list-inside py-1 space-y-1">
        <li>Kubernetes-based development and preview environments</li>
        <li>VCS integration (GitHub, GitLab, Gitea, Forgejo)</li>
        <li>CLI coding agents harness for containerized AI workflows</li>
        <li>Available managed or self-hosted</li>
      </ul>
    </ProjectLayout>
  );
}
