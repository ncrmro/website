import JournalEntryForm from "@/app/dashboard/journal/form";
import { selectSessionViewer, useViewer } from "@/lib/auth";
import { db } from "@/lib/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export const dynamicParams = true;
import { DateTime } from "luxon";
import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";

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
  const timezone = cookies().get("viewer_timezone")?.value;
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
    h1: (p: any) => <h3
        className="text-xl font-semibold text-gray-900 dark:text-white"
        {...p}
    />,
    h2: (p: any) => <h4
        className="text-l font-semibold text-gray-900 dark:text-white"
        {...p}
    />,
    h3: (p: any) => <h5
        className="text-base font-semibold text-gray-900 py-2"
        {...p}
    />,
    p: (p: any) => <p className="py-1" {...p} />,
    hr: (p: any) => <hr className="my-3" {...p} />
}
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default async function JournalPage() {
  const viewer = await useViewer();
  const timezone = cookies().get("viewer_timezone")?.value;
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
      // sql<string>`date(created_date, 'unixepoch', 'utc')`.as(
      //   "created_date_str"
      // ),
    ])
    .orderBy("created_date", "desc")
    .where("user_id", "=", viewer.id)
      .where("id", "is not", "7096f4f6-ced7-4aa7-8a4a-14d1661fd3b3")
    .execute();
  const todayEntry =
    posts[0]?.created_date === currentTimezoneMidnightUnixTimestamp(timezone)
      ? posts.shift()
      : null;

  let idx = 0
  const postLists = [];
  for (const p of posts) {
    const created = DateTime.fromSeconds(p.created_date)

    let body;

    try {
      // @ts-ignore
      body = await <MDXRemote source={p.body} components={components} />;
    } catch (error) {
      // This will assign a custom message with the error message to the 'body' variable
      // @ts-ignore
      body = `An error occurred while rendering the content: ${error.message}`;
    }
    postLists.push(
      <li key={p.id} className="relative flex gap-x-4 dark:text-white">
          <div
              className={classNames(
                  '-bottom-6',
                  'absolute left-0 top-0 flex w-6 justify-center'
              )}
          >
              <div className="w-px bg-gray-200" />
          </div>
          <>
              <div className="relative flex h-6 w-6 pt-9 flex-none items-center justify-center bg-white dark:bg-gray-900">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
              </div>
              <div className="flex-auto rounded-md p-3">

                  <div className="flex justify-between gap-x-4">
                      <div className="py-3 leading-5 text-2xl">
                          {created.weekdayLong} {created.monthLong} {created.day}
                      </div>
                      <time

                          className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                          {created.year}
                      </time>
                  </div>
                  <div>
                      {body}
                  </div>
              </div>
          </>


      </li>
    );
      idx++
  }
  return (
    <div >
      <div className="py-4">

        <JournalEntryForm entry={todayEntry} formAction={submitForm} />
      </div>
      <ul role="list" className="space-y-6">
        {postLists}
      </ul>
    </div>
  );
}
