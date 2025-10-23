import { PostItem } from "@/app/posts/PostItem";
import { getPaginatedPosts, getAllTags } from "@/models/posts";
import React from "react";
import { PostsFilters } from "./PostsFilters";
import Link from "next/link";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const publishedParam = params.published;
  const published =
    publishedParam === "true"
      ? true
      : publishedParam === "false"
        ? false
        : "all";
  const tagId = typeof params.tagId === "string" ? params.tagId : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  const [{ posts, pagination }, tags] = await Promise.all([
    getPaginatedPosts({ search, published, tagId, page }),
    getAllTags(),
  ]);

  return (
    <main className="lg:pr-96">
      <div className="px-2 sm:px-0">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Posts</h1>
          <Link
            href="/dashboard/posts/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create New Post
          </Link>
        </div>

        <PostsFilters tags={tags} />

        <div className="mt-4 mb-4 text-sm text-gray-600">
          Showing {posts.length} of {pagination.total} posts (Page{" "}
          {pagination.page} of {pagination.totalPages})
        </div>

        <ul role="list" className="-mb-8 w-full max-w-none sm:max-w-3xl">
          {posts.map((post: any, index: number) => (
            <PostItem
              key={post.slug}
              post={post}
              evenRow={index !== posts.length - 1}
              dashboard
            />
          ))}
        </ul>

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {pagination.page > 1 && (
              <Link
                href={`/dashboard/posts?${new URLSearchParams({
                  ...(search && { search }),
                  ...(published !== "all" && { published: String(published) }),
                  ...(tagId && { tagId }),
                  page: String(pagination.page - 1),
                }).toString()}`}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            <span className="flex items-center px-4 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            {pagination.page < pagination.totalPages && (
              <Link
                href={`/dashboard/posts?${new URLSearchParams({
                  ...(search && { search }),
                  ...(published !== "all" && { published: String(published) }),
                  ...(tagId && { tagId }),
                  page: String(pagination.page + 1),
                }).toString()}`}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
