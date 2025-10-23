"use client";
import Post from "@/app/posts/[slug]/Post";
import { serializePost } from "@/app/posts/actions";
import { InputField, TextAreaField } from "@/components/InputFields";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Tab } from "@headlessui/react";
import type { PostType } from "../../posts/types";
import PostMedia from "./form_media";
import Link from "next/link";
import SmallBadge from "../../../components/SmallBadge";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function postStateReducer(
  state: PostType,
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) {
  const { name, value } = event.target;
  switch (name) {
    case "slug":
      state[name] = value;
      break;
    case "title":
    case "description":
    case "body":
    case "publish_date":
      state[name] = value;
      // Save these fields to localstorage in case of error.
      if (state.slug !== "")
        localStorage.setItem(state.slug, JSON.stringify(state));
      break;
    case "published":
      state[name] = Number(value) === 1 ? 0 : 1;
      break;
    default:
      throw new Error(`Field was not expected ${name}`);
  }
  return structuredClone(state);
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
  const [state, setState] = React.useReducer(postStateReducer, {
    id: "",
    title: "",
    description: "",
    body: "",
    slug: "",
    published: 0,
    publish_date: "",
    tags: [],
    ...props.post,
  });

  React.useEffect(() => {
    // Prevent overwriting existing stored value on page load
    // Dont start saving until we have a body
    if (
      state.slug !== "" &&
      state.body !== "" &&
      !localStorage.getItem(state.slug)
    )
      localStorage.setItem(state.slug, JSON.stringify(state));
  }, [state]);

  const [serializedBody, setSerializedBody] =
    useState<MDXRemoteSerializeResult>();

  React.useEffect(() => {
    serializePost(state.body).then((serializedBody) =>
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
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/posts"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-[var(--on-background)]">
                {state.title || "Edit Post"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/posts"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                form="post-form"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {state.published === 1 ? "Update & Publish" : "Save Draft"}
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                state.published === 1
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}
            >
              {state.published === 1 ? "Published" : "Draft"}
            </span>
            {state.publish_date && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(state.publish_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <form id="post-form" action={props.action} className="space-y-6">
          {/* Metadata Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Post Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InputField
                  id="title"
                  label="Title"
                  value={state?.title}
                  onChange={setState}
                />
              </div>
              <div className="sm:col-span-2">
                <InputField
                  id="description"
                  label="Description"
                  value={state?.description}
                  onChange={setState}
                />
              </div>
              <div>
                <InputField
                  id="slug"
                  label="Slug"
                  title="Slug can only include lower case letters, numbers and dashes."
                  pattern={"^[a-z0-9\\-]*$"}
                  value={state?.slug}
                  onChange={setState}
                />
              </div>
              <div>
                <InputField
                  type="date"
                  id="publish_date"
                  label="Publish Date"
                  value={state?.publish_date || ""}
                  onChange={setState}
                />
              </div>
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Publication Status
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {state.published === 1
                    ? "This post is live and visible to readers"
                    : "This post is saved as a draft"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setState({
                    target: { name: "published", value: state.published },
                  } as any)
                }
                className={`${
                  state.published === 1 ? "bg-indigo-600" : "bg-gray-200"
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    state.published === 1 ? "translate-x-5" : "translate-x-0"
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
              <input
                type="hidden"
                name="published"
                value={state.published}
              />
            </div>

            {/* Tags */}
            {props.post?.tags && props.post.tags.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {props.post.tags.map((tag) => (
                    <SmallBadge key={tag.id}>{tag.value}</SmallBadge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Editor Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <Tab.Group
              selectedIndex={media ? 2 : preview ? 1 : 0}
              onChange={async (index) => {
                if (index === 2) {
                  router.push(`/dashboard/posts/${params.slug}?media=1`);
                } else if (index === 1 && state) {
                  const serializedBody = await serializePost(state.body);
                  setSerializedBody(serializedBody);
                  router.push(`/dashboard/posts/${params.slug}?preview=1`);
                } else router.push(`/dashboard/posts/${params.slug}`);
              }}
            >
              <Tab.List className="flex border-b border-gray-200 dark:border-gray-700 px-6 pt-4">
                <Tab
                  id="post-edit-tab-write"
                  className={({ selected }) =>
                    classNames(
                      selected
                        ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300",
                      "whitespace-nowrap border-b-2 py-2 px-4 text-sm font-medium"
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
                        ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300",
                      "whitespace-nowrap border-b-2 py-2 px-4 text-sm font-medium"
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
                        ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300",
                      "whitespace-nowrap border-b-2 py-2 px-4 text-sm font-medium"
                    )
                  }
                >
                  Media
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel id="post-edit-panel-edit" className="p-6">
                  <TextAreaField
                    id="body"
                    label="Content"
                    rows={25}
                    placeholder="Write your post content here using Markdown..."
                    value={state?.body}
                    onChange={setState}
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Tip: Press Cmd+E to toggle preview
                  </p>
                </Tab.Panel>
                <Tab.Panel id="post-edit-panel-preview" className="p-6">
                  <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                    {state && serializedBody && (
                      <Post
                        viewer={null}
                        post={state}
                        source={serializedBody}
                      />
                    )}
                  </div>
                </Tab.Panel>
                <Tab.Panel id="post-edit-panel-media" className="p-6">
                  <PostMedia post={props.post!} />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </form>
      </div>
    </main>
  );
}
