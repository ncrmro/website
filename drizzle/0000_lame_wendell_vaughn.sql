CREATE TABLE `sessions` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`user_id` text NOT NULL,
	`last_authenticated` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`username` text,
	`first_name` text,
	`last_name` text,
	`email` text NOT NULL,
	`image` text,
	`password` text NOT NULL,
	`admin` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`description` text NOT NULL,
	`slug` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`publish_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_title_unique` ON `posts` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_user` ON `posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `posts_published` ON `posts` (`published`);--> statement-breakpoint
CREATE TABLE `posts_tags` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`post_id` text NOT NULL,
	`tag_id` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_tags_unique` ON `posts_tags` (`post_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`value` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_value_unique` ON `tags` (`value`);--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`user_id` text NOT NULL,
	`body` text NOT NULL,
	`created_date` integer DEFAULT (strftime('%s', CURRENT_DATE)) NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', CURRENT_TIMESTAMP)) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', CURRENT_TIMESTAMP)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journal_entries_user_date` ON `journal_entries` (`user_id`,`created_date`);--> statement-breakpoint
CREATE TABLE `journal_entry_history` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`journal_entry_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', CURRENT_TIMESTAMP)) NOT NULL,
	FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries`(`id`) ON UPDATE no action ON DELETE no action
);
