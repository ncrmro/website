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
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { toast } from "sonner";
import { useActionState } from "react";

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
  action: (prevState: any, data: FormData) => Promise<{ success: boolean; error?: string }>;
  post?: PostType;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const media = searchParams.get("media") === "1";
  const router = useRouter();
  const [showMetadata, setShowMetadata] = useState(false);
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

  const [actionState, formAction] = useActionState(props.action, null);

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
  // Submit form if viewer presses command/ctrl + enter
  React.useEffect(() => {
    const handleUserKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "e") {
        e.preventDefault();
        if (preview) {
          router.push(`/dashboard/posts/${params.slug}`);
        } else {
          router.push(`/dashboard/posts/${params.slug}?preview=1`);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        const form = document.getElementById("post-form") as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }
    };
    document.addEventListener("keydown", handleUserKeyPress);
    return () => document.removeEventListener("keydown", handleUserKeyPress);
  }, [params.slug, preview, router]);

  // Show toast notifications based on action result
  React.useEffect(() => {
    if (actionState) {
      if (actionState.success) {
        toast.success("Post saved!");
      } else {
        toast.error(actionState.error || "Failed to save post");
      }
    }
  }, [actionState]);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <form id="post-form" action={formAction}>
        {/* Compact Header - Sticky Full Width */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between mb-2 pb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Link
                  href="/dashboard/posts"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5"
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
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-semibold leading-6 text-[var(--on-background)] truncate">
                    {state.title || "Untitled Post"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                  {state.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {state.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
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
                  title={
                    state.published === 1 ? "Published" : "Draft"
                  }
                >
                  <span
                    className={`${
                      state.published === 1 ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
                <input type="hidden" name="published" value={state.published} />
                <Link
                  href="/dashboard/posts"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {state.published === 1 ? "Update" : "Save"}
                </button>
              </div>
            </div>

            {/* Edit Details Toggle */}
            <button
              type="button"
              onClick={() => setShowMetadata(!showMetadata)}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mt-2"
            >
              {showMetadata ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
              Edit Details
            </button>

            {/* Collapsible Metadata Form */}
            <div className={`mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4 ${showMetadata ? "" : "hidden"}`}>
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
          </div>

          {/* Tabs - Part of Sticky Header - Full Width */}
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
            <Tab.List className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex w-full pt-3 px-4 sm:px-6 lg:px-8">
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
                <div className="ml-auto flex items-center text-xs text-gray-500 dark:text-gray-400 pb-2">
                  Cmd+E to preview · Cmd+Enter to save
                </div>
              </div>
            </Tab.List>
          </Tab.Group>
        </div>

        {/* Editor Content Section */}
        <Tab.Group
          selectedIndex={media ? 2 : preview ? 1 : 0}
        >
          <Tab.Panels>
            <Tab.Panel id="post-edit-panel-edit" className="w-full">
              <textarea
                id="body"
                name="body"
                placeholder="Write your post content here using Markdown..."
                value={state?.body}
                onChange={setState}
                className="block w-full border-0 outline-none focus:outline-none resize-none text-base leading-relaxed text-gray-900 placeholder:text-gray-400 dark:text-white dark:bg-[var(--background)] bg-[var(--background)] py-4 min-h-screen overflow-hidden"
              />
            </Tab.Panel>
            <Tab.Panel id="post-edit-panel-preview" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
                {state && serializedBody && (
                  <Post
                    viewer={null}
                    post={state}
                    source={serializedBody}
                  />
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel id="post-edit-panel-media" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <PostMedia post={props.post!} />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </form>
    </main>
  );
}
