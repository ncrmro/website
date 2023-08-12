"use client";
import Post, { PostHeader } from "@/app/posts/[slug]/Post";
import { serializePost } from "@/app/posts/actions";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import React, { useState } from "react";
import { Tab } from "@headlessui/react";
// import {
//   AtSymbolIcon,
//   CodeBracketIcon,
//   LinkIcon,
// } from "@heroicons/react/20/solid";
import type { PostType } from "./types";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PostForm(props: {
  action: (data: FormData) => Promise<void>;
  post?: PostType;
}) {
  const [state, setState] = useState(
    props.post || {
      title: "",
      description: "",
      body: "",
      slug: "",
      published: 0,
      publish_date: "",
    }
  );
  const [serializedBody, setSerializedBody] =
    useState<MDXRemoteSerializeResult>();

  return (
    // @ts-ignore
    <form className="w-full md:max-w-4xl" action={props.action}>
      <Tab.Group
        onChange={async (index) => {
          if (index === 1 && state) {
            const serializedBody = await serializePost(state);
            setSerializedBody(serializedBody);
          }
        }}
      >
        <Tab.List className="flex items-center">
          <Tab
            className={({ selected }) =>
              classNames(
                selected
                  ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                "rounded-md border border-transparent px-3 py-1.5 text-sm font-medium"
              )
            }
          >
            Write
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                selected
                  ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                "ml-2 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium"
              )
            }
          >
            Preview
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel className="flex flex-col w-full gap-4">
            <div className="col-span-full">
              <label
                htmlFor="title"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Title
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={state?.title}
                  onChange={(e) =>
                    state && setState({ ...state, title: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="col-span-full">
              <label
                htmlFor="slug"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Slug
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  title="Slug can only include lower case letters, numbers and dashes."
                  pattern={"^[a-z0-9\\-]*$"}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={state?.slug}
                  onChange={(e) =>
                    state && setState({ ...state, slug: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="col-span-full">
              <label htmlFor="description">Description</label>
              <div className="mt-2">
                <input
                  type="text"
                  name="description"
                  id="description"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={state?.description}
                  onChange={(e) =>
                    state && setState({ ...state, description: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label htmlFor="body">Body</label>
              <div className="mt-2">
                <textarea
                  rows={30}
                  name="body"
                  id="body"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Add your comment..."
                  value={state?.body}
                  onChange={(e) =>
                    state && setState({ ...state, body: e.target.value })
                  }
                />
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel className="-m-0.5 rounded-lg p-0.5">
            <div className="border-b">
              <div className="mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5 text-gray-800">
                {state && serializedBody && (
                  <Post viewer={null} post={state} source={serializedBody} />
                )}
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
