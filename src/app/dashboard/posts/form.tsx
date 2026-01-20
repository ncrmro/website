"use client";
import Post from "@/app/posts/[slug]/Post";
import { serializePost } from "@/app/posts/actions";
import { InputField, TextAreaField } from "@/components/InputFields";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Tab } from "@headlessui/react";
import type { PostType, PostFormType } from "../../posts/types";
import PostMedia from "./form_media";
import Link from "next/link";
import SmallBadge from "../../../components/SmallBadge";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { toast } from "sonner";
import { useActionState } from "react";
import { slugify } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

const NEW_POST_DRAFT_KEY = "new-post-draft";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function postStateReducer(
  state: PostFormType,
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
      state[name] = value;
      break;
    case "publishDate":
    case "publish_date":
      // Handle both camelCase (state) and snake_case (form field)
      state["publishDate"] = value;
      break;
    case "published":
      // Toggle the published state (value comes from current state)
      state[name] = String(value) === "true" ? false : true;
      break;
    default:
      throw new Error(`Field was not expected ${name}`);
  }
  return structuredClone(state);
}

export default function PostForm(props: {
  action: (prevState: any, data: FormData) => Promise<{ success: boolean; error?: string; slug?: string }>;
  post?: PostType;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const media = searchParams.get("media") === "1";
  const router = useRouter();
  const isNewPost = !props.post;
  const [showMetadata, setShowMetadata] = useState(isNewPost);

  // Load draft from localStorage for new posts
  const getInitialState = (): PostFormType => {
    const baseState: PostFormType = {
      id: "",
      title: "",
      description: "",
      body: "",
      slug: "",
      published: false,
      publishDate: "",
      tags: [],
    };

    // If we have a post prop, merge it and ensure body is always a string
    if (props.post) {
      Object.assign(baseState, props.post, {
        body: props.post.body ?? "",
      });
    }

    if (isNewPost && typeof window !== "undefined") {
      const draft = localStorage.getItem(NEW_POST_DRAFT_KEY);
      if (draft) {
        try {
          return { ...baseState, ...JSON.parse(draft) };
        } catch (e) {
          console.error("Failed to load draft from localStorage", e);
        }
      }
    }
    return baseState;
  };

  const [state, setState] = React.useReducer(
    (state: PostFormType, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      postStateReducer(state, event),
    getInitialState()
  );

  const [actionState, formAction] = useActionState(props.action, null);

  // Debounce the state to avoid excessive localStorage saves and MDX serialization
  const debouncedState = useDebounce(state, 3000);

  // Track last saved state for unsaved changes indicator
  const [lastSavedState, setLastSavedState] = React.useState<string>(
    JSON.stringify(getInitialState())
  );

  // Derive unsaved changes status
  const hasUnsavedChanges = React.useMemo(() => {
    const currentStateStr = JSON.stringify(state);
    return currentStateStr !== lastSavedState;
  }, [state, lastSavedState]);

  // Compute slug preview from title
  const previewSlug = React.useMemo(() => {
    return state.title ? slugify(state.title) : "";
  }, [state.title]);

  // Save to localStorage after debounce delay (3 seconds)
  React.useEffect(() => {
    // Skip if this is the initial state
    if (debouncedState.body === "" && debouncedState.title === "") return;
    
    // Save to localStorage
    if (isNewPost) {
      // For new posts, save using the draft key
      localStorage.setItem(NEW_POST_DRAFT_KEY, JSON.stringify(debouncedState));
    } else if (debouncedState.slug !== "") {
      // For existing posts, save using the slug as key
      localStorage.setItem(debouncedState.slug, JSON.stringify(debouncedState));
    }
  }, [debouncedState, isNewPost]);

  const [serializedBody, setSerializedBody] =
    useState<MDXRemoteSerializeResult>();

  // Serialize post body after debounce delay (3 seconds)
  React.useEffect(() => {
    serializePost(debouncedState.body).then((serializedBody) =>
      setSerializedBody(serializedBody)
    );
  }, [debouncedState.body]);

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
        // Update last saved state
        setLastSavedState(JSON.stringify(state));
        // Clear localStorage draft for new posts
        if (isNewPost) {
          localStorage.removeItem(NEW_POST_DRAFT_KEY);
          // Redirect to edit page after clearing localStorage
          if (actionState.slug) {
            router.push(`/dashboard/posts/${actionState.slug}`);
          }
        }
      } else {
        toast.error(actionState.error || "Failed to save post");
      }
    }
  }, [actionState, state, isNewPost, router]);

  // Validate form before submission
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isNewPost) {
      if (!state.title.trim()) {
        e.preventDefault();
        toast.error("Title is required");
        return;
      }
      if (!state.description.trim()) {
        e.preventDefault();
        toast.error("Description is required");
        return;
      }
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <form id="post-form" action={formAction} onSubmit={handleFormSubmit}>
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
                        state.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {state.published ? "Published" : "Draft"}
                    </span>
                    {state.publishDate && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(state.publishDate).toLocaleDateString()}
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
                {/* Unsaved changes indicator */}
                {hasUnsavedChanges ? (
                  <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <span className="font-medium">Unsaved</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Saved</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setState({
                      target: { name: "published", value: state.published },
                    } as any)
                  }
                  className={`${
                    state.published ? "bg-indigo-600" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                  title={
                    state.published ? "Published" : "Draft"
                  }
                >
                  <span
                    className={`${
                      state.published ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
                <input type="hidden" name="published" value={state.published ? "1" : "0"} />
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
                  {state.published ? "Update" : "Save"}
                </button>
              </div>
            </div>

            {/* Edit Details Toggle */}
            {!isNewPost && (
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
            )}
            {isNewPost && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Post Details (Required)
              </div>
            )}

            {/* Collapsible Metadata Form */}
            <div className={`mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4 ${showMetadata ? "" : "hidden"}`}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <InputField
                    id="title"
                    label="Title"
                    value={state?.title}
                    onChange={setState}
                    required={isNewPost}
                    placeholder=""
                  />
                </div>
                <div className="sm:col-span-2">
                  <InputField
                    id="description"
                    label="Description"
                    value={state?.description}
                    onChange={setState}
                    required={isNewPost}
                    placeholder=""
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
                    placeholder={state.slug ? "" : previewSlug}
                  />
                  {!state.slug && previewSlug && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Auto-generated from title: <span className="font-mono">{previewSlug}</span>
                    </p>
                  )}
                </div>
                <div>
                  <InputField
                    type="date"
                    id="publish_date"
                    label="Publish Date"
                    value={state?.publishDate || ""}
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
            <Tab.Panel id="post-edit-panel-edit" className="w-full relative">
              {isNewPost && (
                <div className="absolute inset-0 flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400 bg-[var(--background)] z-10 pointer-events-auto">
                  <div className="text-center max-w-md px-4">
                    <p className="text-lg font-medium mb-2">Save Post Details First</p>
                    <p className="text-sm">
                      Please fill out the title, description, and tags in the Edit Details section above, then save the post before editing the body content.
                    </p>
                  </div>
                </div>
              )}
              <textarea
                id="body"
                name="body"
                placeholder="Write your post content here using Markdown..."
                value={state?.body}
                onChange={setState}
                disabled={isNewPost}
                className={`block w-full border-0 outline-none focus:outline-none resize-none text-base leading-relaxed text-gray-900 placeholder:text-gray-400 dark:text-white dark:bg-[var(--background)] bg-[var(--background)] py-4 min-h-screen overflow-hidden ${isNewPost ? "pointer-events-none" : ""}`}
              />
            </Tab.Panel>
            <Tab.Panel id="post-edit-panel-preview" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              {isNewPost ? (
                <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
                  <div className="text-center max-w-md px-4">
                    <p className="text-lg font-medium mb-2">Save Post Details First</p>
                    <p className="text-sm">
                      Preview will be available after you save the post with title and description.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
                  {state && serializedBody && (
                    <Post
                      viewer={null}
                      post={state}
                      source={serializedBody}
                    />
                  )}
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel id="post-edit-panel-media" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              {isNewPost ? (
                <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
                  <div className="text-center max-w-md px-4">
                    <p className="text-lg font-medium mb-2">Save Post Details First</p>
                    <p className="text-sm">
                      Media uploads will be available after you save the post with title and description.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <PostMedia post={props.post!} />
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </form>
    </main>
  );
}
