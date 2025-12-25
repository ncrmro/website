import ProjectLayout from "../ProjectLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meze - Nicholas Romero",
  description: "Meze project",
};

export default function MezePage() {
  return (
    <ProjectLayout
      title="Meze"
      description="meze.fyi"
      url="https://meze.fyi"
    >
      <p className="py-1">
        {/* Add project details here */}
      </p>
    </ProjectLayout>
  );
}
