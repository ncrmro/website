"use client";
import Post from "@/app/posts/[slug]/Post";
import { serializePost } from "@/app/posts/actions";
import SmallBadge from "@/components/SmallBadge";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Tab } from "@headlessui/react";
import type { PostType } from "../../posts/types";
import PostMedia from "./form_media";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PostForm(props: {
  action: (data: FormData) => Promise<void>;
  post?: PostType;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const media = searchParams.get("media") === "1";
  const router = useRouter();
  const [state, setState] = useState(
    props.post || {
      id: "",
      title: "",
      description: "",
      body: "",
      slug: "",
      published: 0,
      publish_date: "",
      tags: [],
    }
  );
  const [serializedBody, setSerializedBody] =
    useState<MDXRemoteSerializeResult>();

  // Keyboard listener
  React.useEffect(() => {
    serializePost(state).then((serializedBody) =>
      setSerializedBody(serializedBody)
    );
  }, [state]);

  // Navigate to preview if viewer presses command + e
  React.useEffect(() => {
    const handleUserKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "e") {
        if (preview) {
          router.push(`/dashboard/posts/${params.slug}`);
        } else {
          router.push(`/dashboard/posts/${params.slug}?preview=1`);
        }
      }
    };
    document.addEventListener("keydown", handleUserKeyPress);
    return () => document.removeEventListener("keydown", handleUserKeyPress);
  }, [params.slug, preview, router]);

  return (
    <main className="lg:pr-96">
      <form
        className="w-full md:max-w-4xl"
        // @ts-ignore
        action={props.action}
      >
        <Tab.Group
          selectedIndex={media ? 2 : preview ? 1 : 0}
          onChange={async (index) => {
            if (index === 2) {
              router.push(`/dashboard/posts/${params.slug}?media=1`);
            } else if (index === 1 && state) {
              const serializedBody = await serializePost(state);
              setSerializedBody(serializedBody);
              router.push(`/dashboard/posts/${params.slug}?preview=1`);
            } else router.push(`/dashboard/posts/${params.slug}`);
          }}
        >
          <Tab.List className="flex items-center">
            <Tab
              id="post-edit-tab-write"
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
              id="post-edit-tab-preview"
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
            <Tab
              id="post-edit-tab-media"
              className={({ selected }) =>
                classNames(
                  selected
                    ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                  "ml-2 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium"
                )
              }
            >
              Media
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel
              id="post-edit-panel-edit"
              className="flex flex-col w-full gap-4"
            >
              <div>
                <label htmlFor="body" className="sr-only">
                  Body
                </label>
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
            <Tab.Panel
              id="post-edit-panel-preview"
              className="-m-0.5 rounded-lg p-0.5"
            >
              <div className="border-b">
                <div className="mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5 text-gray-800">
                  {state && serializedBody && (
                    <Post viewer={null} post={state} source={serializedBody} />
                  )}
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel id="post-edit-panel-media">
              <PostMedia post={props.post!} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <DashboardActivityFeed
          post={props.post}
          state={state}
          setState={setState}
        />
      </form>
    </main>
  );
}
