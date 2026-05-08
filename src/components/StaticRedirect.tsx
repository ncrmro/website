"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function StaticRedirect(props: {
  href: string;
  message: string;
}) {
  const router = useRouter();

  React.useEffect(() => {
    router.replace(props.href);
  }, [props.href, router]);

  return (
    <main className="w-full flex flex-col items-center p-4">
      <p className="text-gray-500 dark:text-gray-400">
        {props.message} <a className="text-blue-700" href={props.href}>Continue</a>.
      </p>
    </main>
  );
}
