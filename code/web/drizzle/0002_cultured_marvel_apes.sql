PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '',
	`description` text NOT NULL,
	`slug` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`publish_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "user_id", "title", "body", "description", "slug", "published", "publish_date", "created_at", "updated_at") SELECT "id", "user_id", "title", "body", "description", "slug", "published", "publish_date", "created_at", "updated_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_title_unique` ON `posts` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_user` ON `posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `posts_published` ON `posts` (`published`);