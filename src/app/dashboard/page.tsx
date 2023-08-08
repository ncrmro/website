import { useViewer } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const viewer = await useViewer();
  if (!viewer)
    redirect(
      `/login?${new URLSearchParams({
        redirect: "/dashboard",
      }).toString()}`
    );

  return <div>Dashboard</div>;
}
