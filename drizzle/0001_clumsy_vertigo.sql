CREATE TABLE "homepage_daily_metrics" (
	"date" date PRIMARY KEY NOT NULL,
	"page_views" integer DEFAULT 0 NOT NULL,
	"unique_visits" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "locale" varchar(10);--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "currency" varchar(50);