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
