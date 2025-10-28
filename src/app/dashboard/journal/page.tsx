import JournalEntryForm from "@/app/dashboard/journal/form";
import { selectSessionViewer, selectViewer } from "@/lib/auth";
import { db } from "@/lib/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export const dynamicParams = true;
import { DateTime } from "luxon";
import React from "react";
import Markdown from "react-markdown";

/**
 * This is the earliest point of a day
 */
function currentTimezoneMidnightUnixTimestamp(timeZone: string) {
  return DateTime.fromObject(
    { hour: 0, minute: 0, second: 0, millisecond: 0 },
    { zone: timeZone }
  ).toUnixInteger();
}

async function submitForm(data: FormData) {
  "use server";
  const viewer = await selectSessionViewer();
  const timezone = (await cookies()).get("viewer_timezone")?.value;
  if (!timezone) throw new Error("Timezone missing!");
  if (!viewer) throw new Error("Viewer doesnt exist");
  const existingPost = data.get("id");
  const body = data.get("body");
  if (typeof body !== "string" || body === "")
    throw new Error("Body was not string or was an empty value");
  if (existingPost) {
    const id = data.get("id");
    if (typeof id !== "string" || id === "")
      throw new Error("Body was not string or was an empty value");
    await db
      .updateTable("journal_entries")
      .set({ body })
      .where("id", "=", id)
      .execute();
  } else {
    await db
      .insertInto("journal_entries")
      .values({
        user_id: viewer.id,
        body,
        created_date: currentTimezoneMidnightUnixTimestamp(timezone),
      })
      .execute();
  }
}

const components = {
  ul: (p: any) => <ul className="list-disc px-4 py-2" {...p} />,
  code: (p: any) => {
    // Check if this is a code block (has language class) or inline code
    const isCodeBlock = p.className && p.className.startsWith('language-');

    if (isCodeBlock) {
      // For code blocks in journal, use a simple pre-formatted style with vertical spacing
      return (
        <div className="my-4">
          <code className={p.className}>{p.children}</code>
        </div>
      );
    }

    // Style inline code with subtle background
    return (
      <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
        {p.children}
      </code>
    );
  },
  h1: (p: any) => (
    <h3
      className="text-xl font-semibold text-gray-900 dark:text-white"
      {...p}
    />
  ),
  h2: (p: any) => (
    <h4 className="text-l font-semibold text-gray-900 dark:text-white" {...p} />
  ),
  h3: (p: any) => (
    <h5 className="text-base font-semibold text-gray-900 dark:text-white py-2" {...p} />
  ),
  p: (p: any) => <p className="py-1" {...p} />,
  hr: (p: any) => <hr className="my-3" {...p} />,
};
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default async function JournalPage() {
  const viewer = await selectViewer();
  const timezone = (await cookies()).get("viewer_timezone")?.value;
  if (!viewer)
    redirect(
      `/login?${new URLSearchParams({
        redirect: "/dashboard",
      }).toString()}`
    );
  if (!timezone) throw new Error("Timezone missing!");
  const posts = await db
    .selectFrom("journal_entries")
    .select([
      "id",
      "body",
      "created_date",
      //   "created_date_str"
      // sql<string>`date(created_date, 'unixepoch', 'utc')`.as(
      // ),
    ])
    .orderBy("created_date", "desc")
    .where("user_id", "=", viewer.id)
    // .where("id", "not in", [
    //   "7096f4f6-ced7-4aa7-8a4a-14d1661fd3b3",
    //   "7b5b4a6d-008b-4d11-9aaf-66f8acb41d29",
    // ])
    .execute();
  console.log(posts[0]);
  console.log(
    timezone,
    currentTimezoneMidnightUnixTimestamp(timezone),
    posts[0]?.created_date
  );
  const todayEntry =
    posts[0]?.created_date === currentTimezoneMidnightUnixTimestamp(timezone)
      ? posts.shift()
      : null;

  // console.log(todayEntry);
  return (
    <div className="px-2 sm:px-0">
      <div className="text-sm text-gray-500 mb-4">
        Current midnight {currentTimezoneMidnightUnixTimestamp(timezone)}
      </div>
      <div className="py-4">
        <JournalEntryForm entry={todayEntry} formAction={submitForm} />
      </div>
      <ul role="list" className="space-y-4 sm:space-y-6">
        {posts.map((p: any) => {
          const created = DateTime.fromSeconds(p.created_date);

          return (
            <li key={p.id} className="relative flex gap-x-2 sm:gap-x-4 dark:text-white">
              <div
                className={classNames(
                  "-bottom-6",
                  "absolute left-0 top-0 flex w-4 sm:w-6 justify-center"
                )}
              >
                <div className="w-px bg-gray-200" />
              </div>
              <>
                <div className="relative flex h-4 w-4 sm:h-6 sm:w-6 pt-6 sm:pt-9 flex-none items-center justify-center bg-white dark:bg-gray-900">
                  <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                </div>
                <div className="flex-auto rounded-md p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-x-4">
                    <div className="py-2 sm:py-3 leading-5 text-lg sm:text-2xl font-medium">
                      {created.weekdayLong} {created.monthLong} {created.day}
                    </div>
                    <time className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                      {created.year}
                    </time>
                  </div>
                  <div className="prose prose-sm sm:prose max-w-none">
                    <Markdown components={components}>{p.body}</Markdown>
                  </div>
                </div>
              </>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
