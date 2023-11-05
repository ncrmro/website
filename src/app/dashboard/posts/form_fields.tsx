import React from "react";
import SmallBadge from "../../../components/SmallBadge";
import { PostType } from "../../posts/types";
import { InputField } from "@/components/InputFields";

export function PostFormFields({
  post,
  state,
  setState,
}: {
  post?: PostType;
  state: any;
  setState: any;
}) {
    console.log(state)
  return (
    <div className="lg:fixed lg:bottom-0 lg:right-0 lg:top-16 lg:overflow-y-auto lg:border-l lg:border-gray-200 p-2 flex flex-col gap-4 w-96">
      <div className="col-span-full">
        <InputField
          id="title"
          label="Title"
          value={state?.title}
          onChange={setState}
        />
      </div>

      <div className="col-span-full">
        <InputField
          id="description"
          label="Description"
          value={state?.description}
          onChange={setState}
        />
      </div>

      <div className="col-span-full">
        <InputField
          id="slug"
          label="Slug"
          title="Slug can only include lower case letters, numbers and dashes."
          pattern={"^[a-z0-9\\-]*$"}
          value={state?.slug}
          onChange={setState}
        />
      </div>

      <div className="w-full flex justify-between">
        <div>
          <label
            htmlFor="published"
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
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
          <div className="col-span-full">
            <InputField
              type="date"
              id="publish_date"
              label="Date"
              value={state?.publish_date || ""}
              onChange={setState}
            />
          </div>
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
