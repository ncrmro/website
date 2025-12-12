import React from "react";
import DashboardClientLayout from "@/app/dashboard/layout.client";
import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { getGravatarUrl } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout(props: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/dashboard`);
  }

  // Map NextAuth session to Viewer type expected by client layout
  const viewer = {
    id: session.user.id,
    email: session.user.email!,
    image: session.user.image || getGravatarUrl(session.user.email!),
    firstName: session.user.name?.split(" ")[0] || null,
    lastName: session.user.name?.split(" ").slice(1).join(" ") || null,
  };

  return (
    <DashboardClientLayout viewer={viewer}>
      {props.children}
    </DashboardClientLayout>
  );
}
