import JournalEntryForm from "@/app/dashboard/journal/form";
import { selectSessionViewer, useViewer } from "@/lib/auth";
import { db, sql } from "@/lib/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export const dynamicParams = true;
import { DateTime } from "luxon";
import React, { Suspense } from "react";
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
      sql<string>`date(created_date, 'unixepoch', 'utc')`.as(
        "created_date_str"
      ),
    ])
    .orderBy("created_date", "desc")
    .where("user_id", "=", viewer.id)
    .execute();
  const todayEntry =
    posts[0]?.created_date === currentTimezoneMidnightUnixTimestamp(timezone)
      ? posts.shift()
      : null;

  const postLists = [];
  for (const p of posts) {
    // @ts-ignore
    const body =  await <MDXRemote source={p.body} />
    postLists.push(
      <li key={p.id} className="dark:text-white">
        <h2>{p.created_date_str}</h2>
        {body}
      </li>
    );
  }
  return (
    <div className="">
      {/*<div className="flex justify-between">*/}
      {/*  <span>Todays Entry</span>*/}
      {/*  <span>{todayEntry?.created_date}</span>*/}
      {/*</div>*/}
      {/*<div className="flex justify-between">*/}
      {/*  <span>Current Reported Time</span>*/}
      {/*  <span>{currentTimezoneMidnightUnixTimestamp(timezone)}</span>*/}
      {/*</div>*/}
      <div className="py-4">
        <JournalEntryForm entry={todayEntry} formAction={submitForm} />
      </div>
      <ul className="flex flex-col gap-3">
        {postLists}
      </ul>
    </div>
  );
}
