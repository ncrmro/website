-- Make posts.body column optional (remove NOT NULL constraint) and set default to empty string
-- SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table

-- Step 1: Create new table with updated schema
CREATE TABLE `posts_new` (
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

-- Step 2: Copy data from old table to new table
INSERT INTO `posts_new` SELECT * FROM `posts`;

-- Step 3: Drop old table
DROP TABLE `posts`;

-- Step 4: Rename new table to original name
ALTER TABLE `posts_new` RENAME TO `posts`;

-- Step 5: Recreate indexes
CREATE UNIQUE INDEX `posts_title_unique` ON `posts` (`title`);
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);
CREATE INDEX `posts_user` ON `posts` (`user_id`);
CREATE INDEX `posts_published` ON `posts` (`published`);
