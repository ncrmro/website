"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Tag {
  id: string;
  value: string;
}

interface PostsFiltersProps {
  tags: Tag[];
}

export function PostsFilters({ tags }: PostsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [published, setPublished] = useState(
    searchParams.get("published") || "all"
  );
  const [tagId, setTagId] = useState(searchParams.get("tagId") || "");

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (published !== "all") params.set("published", published);
    if (tagId) params.set("tagId", tagId);

    const queryString = params.toString();
    router.push(`/dashboard/posts${queryString ? `?${queryString}` : ""}`);
  }, [search, published, tagId, router]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, updateFilters]);

  // Update immediately for non-search filters
  const handlePublishedChange = (value: string) => {
    setPublished(value);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (value !== "all") params.set("published", value);
    if (tagId) params.set("tagId", tagId);

    const queryString = params.toString();
    router.push(`/dashboard/posts${queryString ? `?${queryString}` : ""}`);
  };

  const handleTagChange = (value: string) => {
    setTagId(value);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (published !== "all") params.set("published", published);
    if (value) params.set("tagId", value);

    const queryString = params.toString();
    router.push(`/dashboard/posts${queryString ? `?${queryString}` : ""}`);
  };

  const clearFilters = () => {
    setSearch("");
    setPublished("all");
    setTagId("");
    router.push("/dashboard/posts");
  };

  const hasActiveFilters = search || published !== "all" || tagId;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700"
          >
            Search
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or content..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="sm:w-48">
          <label
            htmlFor="published"
            className="block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="published"
            value={published}
            onChange={(e) => handlePublishedChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
          >
            <option value="all">All Posts</option>
            <option value="true">Published</option>
            <option value="false">Drafts</option>
          </select>
        </div>

        <div className="sm:w-48">
          <label
            htmlFor="tag"
            className="block text-sm font-medium text-gray-700"
          >
            Tag
          </label>
          <select
            id="tag"
            value={tagId}
            onChange={(e) => handleTagChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
