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
import { PostFormFields } from "@/app/dashboard/posts/form_fields";

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
    case "published_date":
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
  const [state, setState] = React.useReducer(
    postStateReducer,
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
              const serializedBody = await serializePost(state.body);
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
                <TextAreaField
                  id="body"
                  label="Body"
                  rows={30}
                  placeholder="Add your comment..."
                  value={state?.body}
                  onChange={setState}
                />
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

        <PostFormFields post={props.post} state={state} setState={setState} />
      </form>
    </main>
  );
}
