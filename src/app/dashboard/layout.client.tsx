"use client";
import React, { ReactNode } from "react";
import { Viewer } from "@/lib/auth";

export default function DashboardClientLayout(props: {
  viewer: Viewer;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main>
        {props.children}
      </main>
    </div>
  );
}
