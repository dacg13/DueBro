CREATE TABLE "academic_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deadlines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"subject_id" uuid,
	"term_id" uuid,
	"title" text NOT NULL,
	"type" text DEFAULT 'other' NOT NULL,
	"due_date" date,
	"due_time" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"estimated_effort_hours" real,
	"location" text,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recurrence_rule_id" uuid,
	"original_occurrence_date" date,
	"completed_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"daily_capacity_hours" real DEFAULT 2 NOT NULL,
	"weekend_capacity_hours" real DEFAULT 4 NOT NULL,
	"quiet_hours_start" text,
	"quiet_hours_end" text,
	"notification_preferences" jsonb DEFAULT '{"upcoming":{"push":true,"email":true},"critical":{"push":true,"email":true},"overdue":{"push":true,"email":true},"exam":{"push":true,"email":true},"digest":{"push":false,"email":false},"workload":{"push":true,"email":false}}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurrence_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"rrule_string" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurrence_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"original_date" date NOT NULL,
	"is_skipped" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subtasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deadline_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deadline_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"mode" text DEFAULT 'relative' NOT NULL,
	"offset_minutes" integer,
	"fire_at" timestamp with time zone NOT NULL,
	"channels" jsonb DEFAULT '["push","email"]'::jsonb NOT NULL,
	"is_dispatched" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reminder_id" uuid,
	"user_id" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_term_id_academic_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."academic_terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_recurrence_rule_id_recurrence_rules_id_fk" FOREIGN KEY ("recurrence_rule_id") REFERENCES "public"."recurrence_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_term_id_academic_terms_id_fk" FOREIGN KEY ("term_id") REFERENCES "public"."academic_terms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurrence_rules" ADD CONSTRAINT "recurrence_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurrence_exceptions" ADD CONSTRAINT "recurrence_exceptions_rule_id_recurrence_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."recurrence_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurrence_exceptions" ADD CONSTRAINT "recurrence_exceptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_deadline_id_deadlines_id_fk" FOREIGN KEY ("deadline_id") REFERENCES "public"."deadlines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_deadline_id_deadlines_id_fk" FOREIGN KEY ("deadline_id") REFERENCES "public"."deadlines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_reminder_id_reminders_id_fk" FOREIGN KEY ("reminder_id") REFERENCES "public"."reminders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "academic_terms_user_start_idx" ON "academic_terms" USING btree ("user_id","start_date");--> statement-breakpoint
CREATE INDEX "deadlines_user_date_status_idx" ON "deadlines" USING btree ("user_id","due_date","status");--> statement-breakpoint
CREATE INDEX "deadlines_subject_date_idx" ON "deadlines" USING btree ("subject_id","due_date");--> statement-breakpoint
CREATE INDEX "deadlines_user_status_idx" ON "deadlines" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "deadlines_recurrence_instance_idx" ON "deadlines" USING btree ("recurrence_rule_id","original_occurrence_date");--> statement-breakpoint
CREATE INDEX "subjects_term_archived_idx" ON "subjects" USING btree ("term_id","archived");--> statement-breakpoint
CREATE INDEX "subjects_user_archived_idx" ON "subjects" USING btree ("user_id","archived");--> statement-breakpoint
CREATE INDEX "recurrence_rules_user_idx" ON "recurrence_rules" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recurrence_exceptions_rule_date_idx" ON "recurrence_exceptions" USING btree ("rule_id","original_date");--> statement-breakpoint
CREATE INDEX "recurrence_exceptions_user_idx" ON "recurrence_exceptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subtasks_deadline_pos_idx" ON "subtasks" USING btree ("deadline_id","position");--> statement-breakpoint
CREATE INDEX "subtasks_user_idx" ON "subtasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reminders_fire_dispatched_idx" ON "reminders" USING btree ("fire_at","is_dispatched");--> statement-breakpoint
CREATE INDEX "reminders_deadline_idx" ON "reminders" USING btree ("deadline_id");--> statement-breakpoint
CREATE INDEX "reminders_user_idx" ON "reminders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_reminder_channel_status_idx" ON "notifications" USING btree ("reminder_id","channel","status");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint

-- Row-Level Security (RLS) Policies on Every Table
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Users can view own profile" ON "users" FOR SELECT USING (auth.uid()::text = id);--> statement-breakpoint
CREATE POLICY "Users can update own profile" ON "users" FOR UPDATE USING (auth.uid()::text = id);--> statement-breakpoint
CREATE POLICY "Users can insert own profile" ON "users" FOR INSERT WITH CHECK (auth.uid()::text = id);--> statement-breakpoint

ALTER TABLE "academic_terms" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Users can manage own academic terms" ON "academic_terms" FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);--> statement-breakpoint

ALTER TABLE "subjects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Users can manage own subjects" ON "subjects" FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);--> statement-breakpoint

ALTER TABLE "recurrence_rules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Users can manage own recurrence rules" ON "recurrence_rules" FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);--> statement-breakpoint

ALTER TABLE "deadlines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Users can manage own deadlines" ON "deadlines" FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);--> statement-breakpoint

ALTER TABLE "recurrence_exceptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Users can manage own recurrence exceptions" ON "recurrence_exceptions" FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);--> statement-breakpoint

ALTER TABLE "subtasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Users can manage own subtasks" ON "subtasks" FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);--> statement-breakpoint

ALTER TABLE "reminders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Users can manage own reminders" ON "reminders" FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);--> statement-breakpoint

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Users can view own notifications" ON "notifications" FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);