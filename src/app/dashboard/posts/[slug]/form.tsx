"use client";
import Post, { PostHeader } from "@/app/posts/[slug]/Post";
import { serializePost } from "@/app/posts/actions";
import SmallBadge from "@/components/SmallBadge";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Tab } from "@headlessui/react";
// import {
//   AtSymbolIcon,
//   CodeBracketIcon,
//   LinkIcon,
// } from "@heroicons/react/20/solid";
import type { PostType } from "../../../posts/types";
import { default as NextImage } from "next/image";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function PostMedia(props: { post: PostType }) {
  const [files, setFiles] = useState([]);
  React.useEffect(() => {
    fetch(`/api/posts/uploads?postId=${props.post.id}`).then(async (res) => {
      const data = await res.json();
      setFiles(data.files as []);
    });
  }, []);
  return (
    <div>
      {files.map((file) => (
        <div key={file}>
          {file}
          <NextImage
            alt=""
            width={500}
            height={500}
            src={`/uploads/posts/${props.post.id}/${file}`}
          />
        </div>
      ))}
    </div>
  );
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
  }, []);

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
  }, [preview]);

  console.log(String(state.published));
  return (
    // @ts-ignore
    <form className="w-full md:max-w-4xl" action={props.action}>
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
          {/* These buttons are here simply as examples and don't actually do anything. */}
          {/*{selectedIndex === 0 ? (*/}
          {/*  <div className="ml-auto flex items-center space-x-5">*/}
          {/*    <div className="flex items-center">*/}
          {/*      <button*/}
          {/*        type="button"*/}
          {/*        className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"*/}
          {/*      >*/}
          {/*        <span className="sr-only">Insert link</span>*/}
          {/*        <LinkIcon className="h-5 w-5" aria-hidden="true" />*/}
          {/*      </button>*/}
          {/*    </div>*/}
          {/*    <div className="flex items-center">*/}
          {/*      <button*/}
          {/*        type="button"*/}
          {/*        className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"*/}
          {/*      >*/}
          {/*        <span className="sr-only">Insert code</span>*/}
          {/*        <CodeBracketIcon className="h-5 w-5" aria-hidden="true" />*/}
          {/*      </button>*/}
          {/*    </div>*/}
          {/*    <div className="flex items-center">*/}
          {/*      <button*/}
          {/*        type="button"*/}
          {/*        className="-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"*/}
          {/*      >*/}
          {/*        <span className="sr-only">Mention someone</span>*/}
          {/*        <AtSymbolIcon className="h-5 w-5" aria-hidden="true" />*/}
          {/*      </button>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*) : null}*/}
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel
            id="post-edit-panel-edit"
            className="flex flex-col w-full gap-4"
          >
            <input
              type="file"
              id="myFile"
              name="filename"
              accept="image/*"
              multiple
              onChange={async (e) => {
                if (!props.post?.id)
                  throw new Error(
                    "Post media uploads only work on existing post edits"
                  );
                if (!e.target.files) throw new Error("No files");

                const body = new FormData();
                body.set("postId", props.post.id);
                for (let x = 0; x < e.target.files.length; x++) {
                  const file = e.target.files[x];
                  body.append("files", file);
                }

                await fetch("/api/posts/uploads", {
                  method: "POST",
                  body,
                  credentials: "include",
                });
              }}
            />

            <div>
              {props.post?.tags.map((tag) => (
                <SmallBadge key={tag.id}>{tag.value}</SmallBadge>
              ))}
            </div>

            <label
              htmlFor="published"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Published
            </label>
            <input
              id="published"
              name="published"
              type="checkbox"
              checked={state.published === 1}
              onChange={(e) => {
                setState({
                  ...state,
                  published: Number(e.target.value) === 1 ? 0 : 1,
                });
              }}
            />
            <label
              htmlFor="published-date"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Published Date
            </label>
            <input
              id="published-date"
              name="published_date"
              type="date"
              value={state.publish_date || ""}
              onChange={(e) => {
                setState({
                  ...state,
                  publish_date: e.target.value,
                });
              }}
            />

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
