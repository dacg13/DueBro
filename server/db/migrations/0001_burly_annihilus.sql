CREATE TABLE "class_group_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_group_id" uuid NOT NULL,
	"invited_user_id" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "class_group_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_group_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"local_subject_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	CONSTRAINT "class_group_members_group_user_unique" UNIQUE("class_group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "class_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shared_deadlines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_group_id" uuid NOT NULL,
	"created_by_user_id" text NOT NULL,
	"last_edited_by_user_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'other' NOT NULL,
	"due_date" date NOT NULL,
	"due_time" text,
	"location" text,
	"shared_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" text NOT NULL,
	"addressee_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone,
	CONSTRAINT "friendships_unordered_pair_unique" UNIQUE("requester_id","addressee_id")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "notification_preferences" SET DEFAULT '{"upcoming":{"push":true,"email":true},"critical":{"push":true,"email":true},"overdue":{"push":true,"email":true},"exam":{"push":true,"email":true},"digest":{"push":false,"email":false},"workload":{"push":true,"email":false},"shared_deadline_added":{"push":true,"email":true},"shared_deadline_edited":{"push":false,"email":false}}'::jsonb;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "shared_deadline_id" uuid;--> statement-breakpoint
ALTER TABLE "class_group_invites" ADD CONSTRAINT "class_group_invites_class_group_id_class_groups_id_fk" FOREIGN KEY ("class_group_id") REFERENCES "public"."class_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_group_invites" ADD CONSTRAINT "class_group_invites_invited_user_id_users_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_group_invites" ADD CONSTRAINT "class_group_invites_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_group_members" ADD CONSTRAINT "class_group_members_class_group_id_class_groups_id_fk" FOREIGN KEY ("class_group_id") REFERENCES "public"."class_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_group_members" ADD CONSTRAINT "class_group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_group_members" ADD CONSTRAINT "class_group_members_local_subject_id_subjects_id_fk" FOREIGN KEY ("local_subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_deadlines" ADD CONSTRAINT "shared_deadlines_class_group_id_class_groups_id_fk" FOREIGN KEY ("class_group_id") REFERENCES "public"."class_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_deadlines" ADD CONSTRAINT "shared_deadlines_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_deadlines" ADD CONSTRAINT "shared_deadlines_last_edited_by_user_id_users_id_fk" FOREIGN KEY ("last_edited_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_users_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_group_invites_invited_user_idx" ON "class_group_invites" USING btree ("invited_user_id","status");--> statement-breakpoint
CREATE INDEX "class_group_invites_group_idx" ON "class_group_invites" USING btree ("class_group_id");--> statement-breakpoint
CREATE INDEX "class_group_members_group_status_idx" ON "class_group_members" USING btree ("class_group_id","status");--> statement-breakpoint
CREATE INDEX "class_group_members_user_idx" ON "class_group_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "class_groups_creator_idx" ON "class_groups" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "shared_deadlines_group_due_idx" ON "shared_deadlines" USING btree ("class_group_id","due_date");--> statement-breakpoint
CREATE INDEX "shared_deadlines_group_idx" ON "shared_deadlines" USING btree ("class_group_id");--> statement-breakpoint
CREATE INDEX "friendships_requester_status_idx" ON "friendships" USING btree ("requester_id","status");--> statement-breakpoint
CREATE INDEX "friendships_addressee_status_idx" ON "friendships" USING btree ("addressee_id","status");--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_shared_deadline_id_shared_deadlines_id_fk" FOREIGN KEY ("shared_deadline_id") REFERENCES "public"."shared_deadlines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deadlines_shared_deadline_idx" ON "deadlines" USING btree ("shared_deadline_id");