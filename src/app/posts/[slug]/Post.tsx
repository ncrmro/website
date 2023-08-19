"use client";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { default as NextImage } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { MDXRemote } from "next-mdx-remote";
import Highlight from "react-highlight";
import "./code-block.css";
import type { PostType } from "../types";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function PostHeader(props: { viewer: any; post: PostType }) {
  // If viewer is logged in and press command + e direct to edit page
  const router = useRouter();
  React.useEffect(() => {
    const handleUserKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "e")
        router.push(`/posts/${props.post.slug}/edit`);
    };
    document.addEventListener("keydown", handleUserKeyPress);
    return () => document.removeEventListener("keydown", handleUserKeyPress);
  }, []);
  return (
    <div className="border-b border-gray-200 pb-5">
      <div className="sm:flex sm:items-baseline sm:justify-between">
        <div className="sm:w-0 sm:flex-1">
          <h1
            id="message-heading"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            {props.post.title}
          </h1>
          <p className="mt-1 truncate text-sm text-gray-500">
            {props.post.description}
          </p>
        </div>

        {props.viewer && (
          <div className="mt-4 flex items-center justify-between sm:ml-6 sm:mt-0 sm:flex-shrink-0 sm:justify-start">
            {props.post.published === 0 && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Draft
              </span>
            )}
            <Menu as="div" className="relative ml-3 inline-block text-left">
              <div>
                <Menu.Button
                  id="menu-actions-button"
                  className="-my-2 flex items-center rounded-full bg-white p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href={`/posts/${props.post.slug}/edit`}
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "flex justify-between px-4 py-2 text-sm"
                          )}
                        >
                          <span>Edit</span>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "flex justify-between px-4 py-2 text-sm"
                          )}
                        >
                          <span>Duplicate</span>
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "flex w-full justify-between px-4 py-2 text-sm"
                          )}
                        >
                          <span>Archive</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Post(props: {
  viewer: any;
  source: any;
  post: PostType;
}) {
  return (
    <>
      <PostHeader viewer={props.viewer} post={props.post} />
      <div id="post-body" className="py-3">
        <MDXRemote
          {...props.source}
          components={{
            ul: (p: any) => <ul className="list-disc px-4 py-2" {...p} />,
            code: (p: any) => (
              <Highlight className={p.className}>{p.children}</Highlight>
            ),
            h2: (p: any) => (
              <div className="border-b border-gray-200 py-3">
                <h2
                  className="text-base font-semibold leading-6 text-gray-900"
                  {...p}
                />
              </div>
            ),
            h3: (p: any) => (
              <h3
                className="text-base font-semibold leading-6 text-gray-900 py-2"
                {...p}
              />
            ),
            p: (p: any) => <p className="py-1" {...p} />,
            Image: (p: any) => (
              <div style={{ display: "flex", justifyContent: "center" }}>
                {/*// @ts-ignore/*/}
                <NextImage
                  {...props}
                  alt={p.alt}
                  width={500}
                  height={500}
                  src={`/uploads/posts/${props.post.id}/${p.src}`}
                />
              </div>
            ),
            a: (p: any) => <a className="text-blue-700" {...p} />,
          }}
        />
      </div>
    </>
  );
}
