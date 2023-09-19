import React from "react";
import DashboardClientLayout from "@/app/dashboard/layout.client";
import { redirect } from "next/navigation";
import { useViewer } from "@/lib/auth";

export default async function DashboardLayout(props: {
  children: React.ReactNode;
}) {
  const viewer = await useViewer();
  if (!viewer)
    redirect(
      `/login?${new URLSearchParams({
        redirect: "/dashboard",
      }).toString()}`
    );

  return (
    <DashboardClientLayout viewer={viewer}>
      {props.children}
    </DashboardClientLayout>
  );
}
