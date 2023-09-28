import JournalEntryForm from "@/app/dashboard/journal/form";
import { selectSessionViewer, useViewer } from "@/lib/auth";
import { db, sql } from "@/lib/database";
import { redirect } from "next/navigation";
export const dynamicParams = true;

/**
 * This is the earliest point of a day
 */
function currentTimezoneMidnightUnixTimestamp() {
  const d = new Date();
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);

  return Math.floor(d.getTime() / 1000);
}

async function submitForm(data: FormData) {
  "use server";
  const viewer = await selectSessionViewer();
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
        created_date: currentTimezoneMidnightUnixTimestamp(),
      })
      .execute();
  }
}

export default async function JournalPage() {
  const viewer = await useViewer();
  if (!viewer)
    redirect(
      `/login?${new URLSearchParams({
        redirect: "/dashboard",
      }).toString()}`
    );
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
    posts[0]?.created_date === currentTimezoneMidnightUnixTimestamp()
      ? posts.shift()
      : null;
  return (
    <div className="max-w-2xl">
      <div className="flex justify-between">
        <span>Todays Entry</span>
        <span>{todayEntry?.created_date}</span>
      </div>
      <div className="flex justify-between">
        <span>Current Reported Time</span>
        <span>{currentTimezoneMidnightUnixTimestamp()}</span>
      </div>
      <div className="py-4">
        <JournalEntryForm entry={todayEntry} formAction={submitForm} />
      </div>
      <ul className="flex flex-col gap-3">
        {posts.map((n) => (
          <li key={n.id} className="dark:text-white">
            <h2>{n.created_date_str}</h2>
            <p>{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
