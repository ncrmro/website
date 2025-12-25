import ProjectLayout from "../ProjectLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latinum - Nicholas Romero",
  description: "Latinum project",
};

export default function LatinumPage() {
  return (
    <ProjectLayout
      title="Latinum"
      description="latinum.space"
      url="https://latinum.space"
    >
      <p className="py-1">
        {/* Add project details here */}
      </p>
    </ProjectLayout>
  );
}
