"use client";
import Link from "next/link";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";
import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Viewer } from "@/lib/auth";
import Image from "next/image";

const navigation = [
  {
    name: "Posts",
    href: "/dashboard/posts",
    icon: FolderIcon,
    children: [{}],
  },
  {
    name: "Journal",
    href: "/dashboard/journal",
    icon: FolderIcon,
    children: [
      {
        name: "Current",
        href: "/dashboard/journal/current",
      },
    ],
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function DashboardDesktopSidebar(props: { viewer: Viewer }) {
  const pathname = usePathname();
  return (
    <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 ring-1 ring-white/5 border-r border-gray-200">
        <div className="flex h-16 shrink-0 items-center dark:text-white">
          NCRMRO
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      // @ts-ignore
                      href={item.href}
                      className={classNames(
                        pathname === item.href
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li className="-mx-6 mt-auto">
              <a
                href="#"
                className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-on-background hover:bg-gray-800"
              >
                <Image
                  className="h-8 w-8 rounded-full bg-gray-800"
                  width={25}
                  height={25}
                  src={props.viewer.image}
                  alt=""
                />
                <span className="sr-only">Your profile</span>
                <span
                  aria-hidden="true"
                  className="dark:text-white"
                >{`${props.viewer.first_name} ${props.viewer.last_name}`}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default function DashboardClientLayout(props: {
  viewer: Viewer;
  children: ReactNode;
}) {
  return (
    <div className="h-full">
      {/*<DashboardSidebar viewer={props.viewer} teams={props.teams} />*/}
      {/* Static sidebar for desktop */}
      <DashboardDesktopSidebar viewer={props.viewer} />

      <div className="xl:pl-72">{props.children}</div>
    </div>
  );
}
