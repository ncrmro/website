export default function DashboardPostsLayout(props: {
  children: React.ReactNode;
}) {
  return <div className="p-2 sm:p-4 max-w-full">{props.children}</div>;
}
