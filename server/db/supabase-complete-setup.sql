-- ============================================================================
-- DueBro: Complete Supabase Database Setup Script
-- Run this entire script in your Supabase SQL Editor
-- It creates:
--   1. All database tables & indexes
--   2. Automatic user profile creation trigger on Auth signup (Google OAuth & Email)
--   3. All Row-Level Security (RLS) policies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  timezone text DEFAULT 'UTC' NOT NULL,
  daily_capacity_hours real DEFAULT 2 NOT NULL,
  weekend_capacity_hours real DEFAULT 4 NOT NULL,
  quiet_hours_start text,
  quiet_hours_end text,
  notification_preferences jsonb DEFAULT '{"upcoming":{"push":true,"email":true},"critical":{"push":true,"email":true},"overdue":{"push":true,"email":true},"exam":{"push":true,"email":true},"digest":{"push":false,"email":false},"workload":{"push":true,"email":false},"shared_deadline_added":{"push":true,"email":true},"shared_deadline_edited":{"push":false,"email":false}}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. ACADEMIC TERMS TABLE
CREATE TABLE IF NOT EXISTS public.academic_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS academic_terms_user_id_idx ON public.academic_terms(user_id);

-- 3. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  term_id uuid NOT NULL REFERENCES public.academic_terms(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL,
  archived boolean DEFAULT false NOT NULL,
  archived_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS subjects_user_id_idx ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS subjects_term_id_idx ON public.subjects(term_id);

-- 4. RECURRENCE RULES TABLE
CREATE TABLE IF NOT EXISTS public.recurrence_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rrule_string text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS recurrence_rules_user_id_idx ON public.recurrence_rules(user_id);

-- 5. RECURRENCE EXCEPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.recurrence_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  rule_id uuid NOT NULL REFERENCES public.recurrence_rules(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  original_date date NOT NULL,
  is_skipped boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS recurrence_exceptions_rule_id_idx ON public.recurrence_exceptions(rule_id);
CREATE INDEX IF NOT EXISTS recurrence_exceptions_user_id_idx ON public.recurrence_exceptions(user_id);

-- 6. CLASS GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.class_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  created_by_user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS class_groups_creator_idx ON public.class_groups(created_by_user_id);

-- 7. CLASS GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.class_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  class_group_id uuid NOT NULL REFERENCES public.class_groups(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  local_subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  status text DEFAULT 'active' NOT NULL,
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  left_at timestamp with time zone,
  CONSTRAINT class_group_members_group_user_unique UNIQUE(class_group_id, user_id)
);

CREATE INDEX IF NOT EXISTS class_group_members_group_status_idx ON public.class_group_members(class_group_id, status);
CREATE INDEX IF NOT EXISTS class_group_members_user_idx ON public.class_group_members(user_id);

-- 8. CLASS GROUP INVITES TABLE
CREATE TABLE IF NOT EXISTS public.class_group_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  class_group_id uuid NOT NULL REFERENCES public.class_groups(id) ON DELETE CASCADE,
  invited_user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invited_by_user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  responded_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS class_group_invites_invited_user_idx ON public.class_group_invites(invited_user_id, status);
CREATE INDEX IF NOT EXISTS class_group_invites_group_idx ON public.class_group_invites(class_group_id);

-- 9. SHARED DEADLINES TABLE
CREATE TABLE IF NOT EXISTS public.shared_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  class_group_id uuid NOT NULL REFERENCES public.class_groups(id) ON DELETE CASCADE,
  created_by_user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  last_edited_by_user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text DEFAULT 'other' NOT NULL,
  due_date date NOT NULL,
  due_time text,
  location text,
  shared_notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS shared_deadlines_group_due_idx ON public.shared_deadlines(class_group_id, due_date);
CREATE INDEX IF NOT EXISTS shared_deadlines_group_idx ON public.shared_deadlines(class_group_id);

-- 10. DEADLINES TABLE
CREATE TABLE IF NOT EXISTS public.deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  term_id uuid REFERENCES public.academic_terms(id) ON DELETE SET NULL,
  shared_deadline_id uuid REFERENCES public.shared_deadlines(id) ON DELETE SET NULL,
  title text NOT NULL,
  type text DEFAULT 'other' NOT NULL,
  due_date date,
  due_time text,
  priority text DEFAULT 'medium' NOT NULL,
  status text DEFAULT 'not_started' NOT NULL,
  progress integer DEFAULT 0 NOT NULL,
  estimated_effort_hours real,
  location text,
  notes text,
  tags jsonb DEFAULT '[]'::jsonb NOT NULL,
  links jsonb DEFAULT '[]'::jsonb NOT NULL,
  recurrence_rule_id uuid REFERENCES public.recurrence_rules(id) ON DELETE SET NULL,
  original_occurrence_date date,
  completed_at timestamp with time zone,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS deadlines_user_due_date_idx ON public.deadlines(user_id, due_date);
CREATE INDEX IF NOT EXISTS deadlines_user_status_idx ON public.deadlines(user_id, status);
CREATE INDEX IF NOT EXISTS deadlines_subject_id_idx ON public.deadlines(subject_id);
CREATE INDEX IF NOT EXISTS deadlines_term_id_idx ON public.deadlines(term_id);
CREATE INDEX IF NOT EXISTS deadlines_shared_deadline_idx ON public.deadlines(shared_deadline_id);

-- 11. SUBTASKS TABLE
CREATE TABLE IF NOT EXISTS public.subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  deadline_id uuid NOT NULL REFERENCES public.deadlines(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  is_completed boolean DEFAULT false NOT NULL,
  position integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS subtasks_deadline_id_idx ON public.subtasks(deadline_id);
CREATE INDEX IF NOT EXISTS subtasks_user_id_idx ON public.subtasks(user_id);

-- 12. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  deadline_id uuid NOT NULL REFERENCES public.deadlines(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode text DEFAULT 'relative' NOT NULL,
  offset_minutes integer,
  fire_at timestamp with time zone NOT NULL,
  channel text DEFAULT 'push' NOT NULL,
  is_dispatched boolean DEFAULT false NOT NULL,
  dispatched_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS reminders_fire_at_idx ON public.reminders(fire_at, is_dispatched);
CREATE INDEX IF NOT EXISTS reminders_deadline_id_idx ON public.reminders(deadline_id);
CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON public.reminders(user_id);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  deadline_id uuid REFERENCES public.deadlines(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);

-- 14. FRIENDSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  requester_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  addressee_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  responded_at timestamp with time zone,
  CONSTRAINT friendships_unordered_pair_unique UNIQUE(requester_id, addressee_id)
);

CREATE INDEX IF NOT EXISTS friendships_requester_status_idx ON public.friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS friendships_addressee_status_idx ON public.friendships(addressee_id, status);


-- ============================================================================
-- AUTH USER SYNC TRIGGER (Google OAuth + Email)
-- Automatically inserts a record into public.users when a user signs up
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.users.name),
      updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- 1. USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile or friends" ON public.users;
CREATE POLICY "Users can view own profile or friends"
  ON public.users FOR SELECT
  USING (
    auth.uid()::text = id
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE (requester_id = auth.uid()::text AND addressee_id = users.id)
         OR (addressee_id = auth.uid()::text AND requester_id = users.id)
    )
    OR EXISTS (
      SELECT 1 FROM public.class_group_members m1
      JOIN public.class_group_members m2 ON m1.class_group_id = m2.class_group_id
      WHERE m1.user_id = auth.uid()::text AND m2.user_id = users.id
    )
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- 2. ACADEMIC TERMS
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own academic terms" ON public.academic_terms;
CREATE POLICY "Users can manage own academic terms"
  ON public.academic_terms FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 3. SUBJECTS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own subjects" ON public.subjects;
CREATE POLICY "Users can manage own subjects"
  ON public.subjects FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 4. RECURRENCE RULES
ALTER TABLE public.recurrence_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recurrence rules" ON public.recurrence_rules;
CREATE POLICY "Users can manage own recurrence rules"
  ON public.recurrence_rules FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 5. RECURRENCE EXCEPTIONS
ALTER TABLE public.recurrence_exceptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recurrence exceptions" ON public.recurrence_exceptions;
CREATE POLICY "Users can manage own recurrence exceptions"
  ON public.recurrence_exceptions FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 6. DEADLINES
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own deadlines" ON public.deadlines;
CREATE POLICY "Users can manage own deadlines"
  ON public.deadlines FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 7. SUBTASKS
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own subtasks" ON public.subtasks;
CREATE POLICY "Users can manage own subtasks"
  ON public.subtasks FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 8. REMINDERS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own reminders" ON public.reminders;
CREATE POLICY "Users can manage own reminders"
  ON public.reminders FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 9. NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 10. FRIENDSHIPS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view friendships they participate in" ON public.friendships;
CREATE POLICY "Users can view friendships they participate in"
  ON public.friendships FOR SELECT
  USING (auth.uid()::text = requester_id OR auth.uid()::text = addressee_id);

DROP POLICY IF EXISTS "Users can send friend requests" ON public.friendships;
CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid()::text = requester_id);

DROP POLICY IF EXISTS "Users can respond to friend requests or block" ON public.friendships;
CREATE POLICY "Users can respond to friend requests or block"
  ON public.friendships FOR UPDATE
  USING (auth.uid()::text = addressee_id OR auth.uid()::text = requester_id);

DROP POLICY IF EXISTS "Users can remove friendships" ON public.friendships;
CREATE POLICY "Users can remove friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid()::text = requester_id OR auth.uid()::text = addressee_id);

-- 11. CLASS GROUPS
ALTER TABLE public.class_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their class groups" ON public.class_groups;
CREATE POLICY "Members can view their class groups"
  ON public.class_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_group_members
      WHERE class_group_members.class_group_id = class_groups.id
        AND class_group_members.user_id = auth.uid()::text
        AND class_group_members.status = 'active'
    )
    OR created_by_user_id = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can create class groups" ON public.class_groups;
CREATE POLICY "Users can create class groups"
  ON public.class_groups FOR INSERT
  WITH CHECK (auth.uid()::text = created_by_user_id);

DROP POLICY IF EXISTS "Members can update their class groups" ON public.class_groups;
CREATE POLICY "Members can update their class groups"
  ON public.class_groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.class_group_members
      WHERE class_group_members.class_group_id = class_groups.id
        AND class_group_members.user_id = auth.uid()::text
        AND class_group_members.status = 'active'
    )
  );

-- 12. CLASS GROUP MEMBERS
ALTER TABLE public.class_group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view co-members in their groups" ON public.class_group_members;
CREATE POLICY "Members can view co-members in their groups"
  ON public.class_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_group_members AS m
      WHERE m.class_group_id = class_group_members.class_group_id
        AND m.user_id = auth.uid()::text
        AND m.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can insert membership" ON public.class_group_members;
CREATE POLICY "Users can insert membership"
  ON public.class_group_members FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id
    OR EXISTS (
      SELECT 1 FROM public.class_groups
      WHERE class_groups.id = class_group_members.class_group_id
        AND class_groups.created_by_user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Members can update their own membership" ON public.class_group_members;
CREATE POLICY "Members can update their own membership"
  ON public.class_group_members FOR UPDATE
  USING (auth.uid()::text = user_id);

-- 13. CLASS GROUP INVITES
ALTER TABLE public.class_group_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invites they sent or received" ON public.class_group_invites;
CREATE POLICY "Users can view invites they sent or received"
  ON public.class_group_invites FOR SELECT
  USING (
    auth.uid()::text = invited_user_id
    OR auth.uid()::text = invited_by_user_id
    OR EXISTS (
      SELECT 1 FROM public.class_group_members
      WHERE class_group_members.class_group_id = class_group_invites.class_group_id
        AND class_group_members.user_id = auth.uid()::text
        AND class_group_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Active group members can send invites" ON public.class_group_invites;
CREATE POLICY "Active group members can send invites"
  ON public.class_group_invites FOR INSERT
  WITH CHECK (
    auth.uid()::text = invited_by_user_id
    AND EXISTS (
      SELECT 1 FROM public.class_group_members
      WHERE class_group_members.class_group_id = class_group_invites.class_group_id
        AND class_group_members.user_id = auth.uid()::text
        AND class_group_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Invited users can respond to invites" ON public.class_group_invites;
CREATE POLICY "Invited users can respond to invites"
  ON public.class_group_invites FOR UPDATE
  USING (auth.uid()::text = invited_user_id);

-- 14. SHARED DEADLINES
ALTER TABLE public.shared_deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view shared deadlines" ON public.shared_deadlines;
CREATE POLICY "Members can view shared deadlines"
  ON public.shared_deadlines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_group_members
      WHERE public.class_group_members.class_group_id = public.shared_deadlines.class_group_id
        AND public.class_group_members.user_id = auth.uid()::text
        AND public.class_group_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Members can create shared deadlines" ON public.shared_deadlines;
CREATE POLICY "Members can create shared deadlines"
  ON public.shared_deadlines FOR INSERT
  WITH CHECK (
    auth.uid()::text = created_by_user_id
    AND EXISTS (
      SELECT 1 FROM public.class_group_members
      WHERE public.class_group_members.class_group_id = public.shared_deadlines.class_group_id
        AND public.class_group_members.user_id = auth.uid()::text
        AND public.class_group_members.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Members can update shared deadlines" ON public.shared_deadlines;
CREATE POLICY "Members can update shared deadlines"
  ON public.shared_deadlines FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.class_group_members
      WHERE public.class_group_members.class_group_id = public.shared_deadlines.class_group_id
        AND public.class_group_members.user_id = auth.uid()::text
        AND public.class_group_members.status = 'active'
    )
  );
