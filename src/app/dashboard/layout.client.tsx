"use client";
import Link from "next/link";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { ReactNode, useState, Fragment } from "react";
import { usePathname } from "next/navigation";
import { Viewer } from "@/lib/auth";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";

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

function NavigationItems(props: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul role="list" className="-mx-2 space-y-1">
      {navigation.map((item) => (
        <li key={item.name}>
          <Link
            href={item.href as any}
            onClick={props.onNavigate}
            className={classNames(
              props.pathname === item.href
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
  );
}

function UserProfile(props: { viewer: Viewer }) {
  return (
    <div className="-mx-6 mt-auto">
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
    </div>
  );
}

function MobileSidebar(props: { 
  viewer: Viewer; 
  sidebarOpen: boolean; 
  setSidebarOpen: (open: boolean) => void;
}) {
  const pathname = usePathname();
  
  return (
    <Transition.Root show={props.sidebarOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 xl:hidden" onClose={props.setSidebarOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex justify-end">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="relative ml-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute right-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={() => props.setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 ring-1 ring-white/10">
                <div className="flex h-16 shrink-0 items-center">
                  <span className="text-white font-semibold text-lg">NCRMRO</span>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <NavigationItems 
                        pathname={pathname} 
                        onNavigate={() => props.setSidebarOpen(false)}
                      />
                    </li>
                    <li>
                      <UserProfile viewer={props.viewer} />
                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function FloatingMenuButton(props: { 
  setSidebarOpen: (open: boolean) => void; 
}) {
  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-50 xl:hidden inline-flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      onClick={() => props.setSidebarOpen(true)}
    >
      <span className="sr-only">Open sidebar</span>
      <Bars3Icon className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}

function DashboardDesktopSidebar(props: { viewer: Viewer }) {
  const pathname = usePathname();
  return (
    <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 ring-1 ring-white/5 border-r border-gray-200 bg-gray-900">
        <div className="flex h-16 shrink-0 items-center">
          <span className="text-white font-semibold text-lg">NCRMRO</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <NavigationItems pathname={pathname} />
            </li>
            <li>
              <UserProfile viewer={props.viewer} />
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-full">
      <MobileSidebar 
        viewer={props.viewer} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      {/* Static sidebar for desktop */}
      <DashboardDesktopSidebar viewer={props.viewer} />

      {/* Floating menu button for mobile */}
      <FloatingMenuButton setSidebarOpen={setSidebarOpen} />

      <div className="xl:pl-72">
        <main className="py-4">
          {props.children}
        </main>
      </div>
    </div>
  );
}
