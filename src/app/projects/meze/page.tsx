import ProjectLayout from "../ProjectLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meze - Nicholas Romero",
  description:
    "Meal planning, nutrition tracking, and grocery shopping assistant",
};

export default function MezePage() {
  return (
    <ProjectLayout
      title="Meze"
      description="meze.fyi"
      url="https://meze.fyi"
    >
      <p className="py-1">
        Meze is a meal planning, nutrition tracking, and grocery shopping
        assistant designed to help users save time and dial in their nutrition
        to achieve their desired physique.
      </p>
      <p className="py-1">
        The app streamlines the entire food workflow—from planning meals and
        tracking macros to generating optimized grocery lists—so users can focus
        on their health goals without the overhead.
      </p>
    </ProjectLayout>
  );
}
