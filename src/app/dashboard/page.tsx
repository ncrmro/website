import { selectViewer } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRecentPosts, getRecentJournalEntries } from "@/models/posts";
import Link from "next/link";
import { DateTime } from "luxon";

export default async function Dashboard() {
  const viewer = await selectViewer();
  if (!viewer)
    redirect(
      `/login?${new URLSearchParams({
        redirect: "/dashboard",
      }).toString()}`
    );

  const [recentPosts, recentJournalEntries] = await Promise.all([
    getRecentPosts(3),
    getRecentJournalEntries(viewer.id, 3),
  ]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posts Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <Link
                href="/dashboard/posts"
                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Posts
              </Link>
              <Link
                href="/dashboard/posts/new"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                New Post
              </Link>
            </div>
            <div className="px-6 py-4">
              {recentPosts.length > 0 ? (
                <ul className="space-y-3">
                  {recentPosts.map((post) => (
                    <li key={post.id} className="group">
                      <Link
                        href={`/dashboard/posts/${post.slug}`}
                        className="block"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                              {post.title}
                            </h3>
                            {post.description && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                {post.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                              post.published === 1
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {post.published === 1 ? "Published" : "Draft"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          Updated {new Date(post.updated_at).toLocaleDateString()}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No posts yet. Create your first post!
                </p>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/dashboard/posts"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                View all posts →
              </Link>
            </div>
          </div>

          {/* Journal Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <Link
                href="/dashboard/journal"
                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Journal
              </Link>
              <Link
                href="/dashboard/journal"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                New Entry
              </Link>
            </div>
            <div className="px-6 py-4">
              {recentJournalEntries.length > 0 ? (
                <ul className="space-y-3">
                  {recentJournalEntries.map((entry) => {
                    const date = DateTime.fromSeconds(entry.created_date);
                    const preview = entry.body.slice(0, 100);

                    return (
                      <li key={entry.id} className="group">
                        <Link
                          href="/dashboard/journal"
                          className="block"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {date.toFormat("EEEE, MMMM d, yyyy")}
                              </h3>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                {preview}{entry.body.length > 100 ? "..." : ""}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No journal entries yet. Start writing today!
                </p>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/dashboard/journal"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                View all entries →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
