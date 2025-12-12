DROP INDEX "users_username_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "posts_title_unique";--> statement-breakpoint
DROP INDEX "posts_slug_unique";--> statement-breakpoint
DROP INDEX "posts_user";--> statement-breakpoint
DROP INDEX "posts_published";--> statement-breakpoint
DROP INDEX "posts_tags_unique";--> statement-breakpoint
DROP INDEX "tags_value_unique";--> statement-breakpoint
DROP INDEX "journal_entries_user_date";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "password" TO "password" text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_title_unique` ON `posts` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_user` ON `posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `posts_published` ON `posts` (`published`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_tags_unique` ON `posts_tags` (`post_id`,`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_value_unique` ON `tags` (`value`);--> statement-breakpoint
CREATE UNIQUE INDEX `journal_entries_user_date` ON `journal_entries` (`user_id`,`created_date`);