import ProjectLayout from "../ProjectLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keystone - Nicholas Romero",
  description: "Keystone project",
};

export default function KeystonePage() {
  return (
    <ProjectLayout
      title="Keystone"
      description="GitHub ncrmro/keystone"
      url="https://github.com/ncrmro/keystone"
    >
      <p className="py-1">
        {/* Add project details here */}
      </p>
    </ProjectLayout>
  );
}
