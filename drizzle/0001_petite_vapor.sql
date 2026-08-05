ALTER TABLE `records` ADD `position` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `records` ADD `done` integer DEFAULT false NOT NULL;