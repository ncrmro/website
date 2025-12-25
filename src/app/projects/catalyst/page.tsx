import ProjectLayout from "../ProjectLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalyst - Nicholas Romero",
  description: "Catalyst project",
};

export default function CatalystPage() {
  return (
    <ProjectLayout
      title="Catalyst"
      description="GitHub ncrmro/catalyst"
      url="https://github.com/ncrmro/catalyst"
    >
      <p className="py-1">
        {/* Add project details here */}
      </p>
    </ProjectLayout>
  );
}
