CREATE TYPE "public"."alert_type" AS ENUM('smoke', 'gas_lpg', 'vape', 'flame', 'test');--> statement-breakpoint
CREATE TYPE "public"."device_status" AS ENUM('online', 'offline', 'warning', 'alert');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"type" "alert_type" NOT NULL,
	"severity" "severity" NOT NULL,
	"mq2_value" integer,
	"mq135_value" integer,
	"flame_value" integer,
	"flame_detected" boolean DEFAULT false,
	"message" text,
	"telegram_sent" boolean DEFAULT false NOT NULL,
	"telegram_sent_at" timestamp,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"triggered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'viewer' NOT NULL,
	"receive_notifications" boolean DEFAULT true NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"device_code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"location" varchar(200),
	"status" "device_status" DEFAULT 'offline' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"firmware_version" varchar(20),
	"mq2_threshold" integer DEFAULT 400,
	"mq135_threshold" integer DEFAULT 300,
	"flame_threshold" integer DEFAULT 500,
	"last_seen_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"alert_id" uuid,
	"channel" varchar(20) NOT NULL,
	"title" varchar(200),
	"body" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sensor_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"mq2_value" integer,
	"mq135_value" integer,
	"flame_value" integer,
	"mq2_ppm" real,
	"mq135_ppm" real,
	"flame_detected" boolean DEFAULT false,
	"is_alert" boolean DEFAULT false NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"user_agent" text,
	"ip_address" varchar(45),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone" varchar(20),
	"avatar_url" text,
	"telegram_chat_id" varchar(50),
	"telegram_username" varchar(100),
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_members" ADD CONSTRAINT "device_members_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_members" ADD CONSTRAINT "device_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alerts_device_idx" ON "alerts" USING btree ("device_id","triggered_at");--> statement-breakpoint
CREATE INDEX "alerts_resolved_idx" ON "alerts" USING btree ("is_resolved","triggered_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_device_member" ON "device_members" USING btree ("device_id","user_id");--> statement-breakpoint
CREATE INDEX "devices_owner_idx" ON "devices" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "devices_code_idx" ON "devices" USING btree ("device_code");--> statement-breakpoint
CREATE INDEX "readings_device_time_idx" ON "sensor_readings" USING btree ("device_id","recorded_at");--> statement-breakpoint
CREATE INDEX "readings_alert_idx" ON "sensor_readings" USING btree ("is_alert","recorded_at");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");