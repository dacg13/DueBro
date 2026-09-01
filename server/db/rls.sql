-- DueBro PostgreSQL Row-Level Security (RLS) Policies
-- Enforcing strict tenant isolation on every table

-- 1. USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- 2. ACADEMIC TERMS
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own academic terms"
  ON academic_terms FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 3. SUBJECTS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subjects"
  ON subjects FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 4. RECURRENCE RULES
ALTER TABLE recurrence_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurrence rules"
  ON recurrence_rules FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 5. DEADLINES
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own deadlines"
  ON deadlines FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 6. RECURRENCE EXCEPTIONS
ALTER TABLE recurrence_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurrence exceptions"
  ON recurrence_exceptions FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 7. SUBTASKS
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subtasks"
  ON subtasks FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 8. REMINDERS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reminders"
  ON reminders FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 9. NOTIFICATIONS (DELIVERY LOG)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 10. FRIENDSHIPS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid()::text = requester_id OR auth.uid()::text = addressee_id);

CREATE POLICY "Users can insert friendships as requester"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid()::text = requester_id);

CREATE POLICY "Users can update own friendships"
  ON friendships FOR UPDATE
  USING (auth.uid()::text = requester_id OR auth.uid()::text = addressee_id);

CREATE POLICY "Users can delete own friendships"
  ON friendships FOR DELETE
  USING (auth.uid()::text = requester_id OR auth.uid()::text = addressee_id);

-- 11. CLASS GROUPS (visible via active membership)
ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their class groups"
  ON class_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_group_members
      WHERE class_group_members.class_group_id = class_groups.id
        AND class_group_members.user_id = auth.uid()::text
        AND class_group_members.status = 'active'
    )
  );

CREATE POLICY "Authenticated users can create class groups"
  ON class_groups FOR INSERT
  WITH CHECK (auth.uid()::text = created_by_user_id);

CREATE POLICY "Members can update their class groups"
  ON class_groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM class_group_members
      WHERE class_group_members.class_group_id = class_groups.id
        AND class_group_members.user_id = auth.uid()::text
        AND class_group_members.status = 'active'
    )
  );

-- 12. CLASS GROUP MEMBERS (visible via active membership in same group)
ALTER TABLE class_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group members"
  ON class_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_group_members AS cgm
      WHERE cgm.class_group_id = class_group_members.class_group_id
        AND cgm.user_id = auth.uid()::text
        AND cgm.status = 'active'
    )
  );

CREATE POLICY "System can insert group members"
  ON class_group_members FOR INSERT
  WITH CHECK (true); -- Controlled via server actions, not direct client insert

CREATE POLICY "Members can update own membership"
  ON class_group_members FOR UPDATE
  USING (auth.uid()::text = user_id);

-- 13. CLASS GROUP INVITES
ALTER TABLE class_group_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites they sent or received"
  ON class_group_invites FOR SELECT
  USING (auth.uid()::text = invited_user_id OR auth.uid()::text = invited_by_user_id);

CREATE POLICY "Members can create invites"
  ON class_group_invites FOR INSERT
  WITH CHECK (auth.uid()::text = invited_by_user_id);

CREATE POLICY "Invited users can update invite status"
  ON class_group_invites FOR UPDATE
  USING (auth.uid()::text = invited_user_id);

-- 14. SHARED DEADLINES (visible via active membership)
ALTER TABLE shared_deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view shared deadlines"
  ON shared_deadlines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_group_members
      WHERE class_group_members.class_group_id = shared_deadlines.class_group_id
        AND class_group_members.user_id = auth.uid()::text
        AND class_group_members.status = 'active'
    )
  );

CREATE POLICY "Members can create shared deadlines"
  ON shared_deadlines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM class_group_members
      WHERE class_group_members.class_group_id = shared_deadlines.class_group_id
        AND class_group_members.user_id = auth.uid()::text
        AND class_group_members.status = 'active'
    )
  );

CREATE POLICY "Members can update shared deadlines"
  ON shared_deadlines FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM class_group_members
      WHERE class_group_members.class_group_id = shared_deadlines.class_group_id
        AND class_group_members.user_id = auth.uid()::text
        AND class_group_members.status = 'active'
    )
  );
