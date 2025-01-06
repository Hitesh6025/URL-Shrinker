CREATE TABLE "url_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip_address" varchar(255),
	"user_agent" varchar(255),
	"short_url" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"url_creation_count" integer DEFAULT 0,
	"last_reset" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "short_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"long_url" text NOT NULL,
	"short_url" varchar(255) NOT NULL,
	"topic" varchar(50),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "short_urls_short_url_unique" UNIQUE("short_url")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"refresh_token" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "url_logs" ADD CONSTRAINT "url_logs_short_url_short_urls_short_url_fk" FOREIGN KEY ("short_url") REFERENCES "public"."short_urls"("short_url") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_limits" ADD CONSTRAINT "rate_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "short_urls" ADD CONSTRAINT "short_urls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;