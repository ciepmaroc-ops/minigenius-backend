-- Enable RLS on all tables
ALTER TABLE parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;

-- Parent accounts: each parent sees only their own row
CREATE POLICY "parent_select_own" ON parent_accounts
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "parent_update_own" ON parent_accounts
  FOR UPDATE USING (auth_user_id = auth.uid());

-- Child profiles: parent sees only their own children
CREATE POLICY "child_select_own" ON child_profiles
  FOR SELECT USING (
    parent_id IN (
      SELECT id FROM parent_accounts WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "child_insert_own" ON child_profiles
  FOR INSERT WITH CHECK (
    parent_id IN (
      SELECT id FROM parent_accounts WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "child_update_own" ON child_profiles
  FOR UPDATE USING (
    parent_id IN (
      SELECT id FROM parent_accounts WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "child_delete_own" ON child_profiles
  FOR DELETE USING (
    parent_id IN (
      SELECT id FROM parent_accounts WHERE auth_user_id = auth.uid()
    )
  );

-- Activity manifests: everyone can read published activities
CREATE POLICY "activity_select_published" ON activity_manifests
  FOR SELECT USING (is_published = TRUE);

-- Activity sessions: parent sees only their children's sessions
CREATE POLICY "session_select_own" ON activity_sessions
  FOR SELECT USING (
    child_id IN (
      SELECT cp.id FROM child_profiles cp
      JOIN parent_accounts pa ON pa.id = cp.parent_id
      WHERE pa.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "session_insert_own" ON activity_sessions
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT cp.id FROM child_profiles cp
      JOIN parent_accounts pa ON pa.id = cp.parent_id
      WHERE pa.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "session_update_own" ON activity_sessions
  FOR UPDATE USING (
    child_id IN (
      SELECT cp.id FROM child_profiles cp
      JOIN parent_accounts pa ON pa.id = cp.parent_id
      WHERE pa.auth_user_id = auth.uid()
    )
  );