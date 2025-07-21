import React from "react";
import DashboardClientLayout from "@/app/dashboard/layout.client";
import { redirect } from "next/navigation";
import { selectViewer } from "@/lib/auth";

export default async function DashboardLayout(props: {
  children: React.ReactNode;
}) {
  const viewer = await selectViewer();
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
