import React from "react";
import SmallBadge from "../../../components/SmallBadge";
import { PostType } from "../../posts/types";

export function PostFormFields({
  post,
  state,
  setState,
}: {
  post?: PostType;
  state: any;
  setState: any;
}) {
  return (
    <div className="lg:fixed lg:bottom-0 lg:right-0 lg:top-16 lg:overflow-y-auto lg:border-l lg:border-gray-200 p-2 flex flex-col gap-4 w-96">
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
            onChange={setState}
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
            onChange={setState}
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
            onChange={setState}
          />
        </div>
      </div>
      <div className="w-full flex justify-between">
        <div>
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
            onChange={setState}
          />
        </div>
        <div>
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
            onChange={setState}
          />
        </div>
      </div>
      <input
        type="file"
        id="myFile"
        name="filename"
        accept="image/*"
        multiple
        onChange={async (e) => {
          if (!post?.id)
            throw new Error(
              "Post media uploads only work on existing post edits"
            );
          if (!e.target.files) throw new Error("No files");

          const body = new FormData();
          body.set("postId", post.id);
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
        {post?.tags.map((tag) => (
          <SmallBadge key={tag.id}>{tag.value}</SmallBadge>
        ))}
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
