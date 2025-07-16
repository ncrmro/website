import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface JournalEntries {
  id: Generated<string>;
  user_id: string;
  body: string;
  created_date: Generated<number>;
  created_at: Generated<number>;
  updated_at: Generated<number>;
}

export interface JournalEntryHistory {
  id: Generated<string>;
  journal_entry_id: string;
  body: string;
  created_at: Generated<number>;
}

export interface Migrations {
  id: number;
  filename: string;
  sha: string;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

export interface Posts {
  id: Generated<string>;
  user_id: string;
  title: string;
  body: string;
  description: string;
  slug: string;
  published: Generated<number>;
  publish_date: string | null;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

export interface PostsTags {
  id: Generated<string>;
  post_id: string;
  tag_id: string;
}

export interface Sessions {
  id: Generated<string>;
  user_id: string;
  last_authenticated: Generated<string>;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

export interface Tags {
  id: Generated<string>;
  value: string;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

export interface Users {
  id: Generated<string>;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  image: string | null;
  password: string;
  admin: Generated<number>;
  created_at: Generated<string>;
  updated_at: Generated<string>;
}

export interface DB {
  journal_entries: JournalEntries;
  journal_entry_history: JournalEntryHistory;
  migrations: Migrations;
  posts: Posts;
  posts_tags: PostsTags;
  sessions: Sessions;
  tags: Tags;
  users: Users;
}
