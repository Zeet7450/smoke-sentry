-- Add NextAuth tables
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(191) NOT NULL,
	"provider" varchar(191) NOT NULL,
	"provider_account_id" varchar(191) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(191),
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" varchar(191) NOT NULL,
	"token" varchar(191) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_id_idx" ON "accounts" USING btree ("provider","provider_account_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_identifier_token_idx" ON "verification_tokens" USING btree ("identifier","token");
