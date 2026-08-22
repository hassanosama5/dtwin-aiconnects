-- Decision Twin — Authentication & Ownership
-- Version: 1.0
--
-- Adds per-user ownership to twins/projects and replaces the MVP's
-- "allow all" RLS policies with real auth.uid()-scoped ones. Messages don't
-- get their own owner_id column -- their RLS is scoped through the project
-- they belong to (one join, acceptable at this scale), matching how the
-- app never lets a message exist without a project.
--
-- Existing rows (the seeded demo twin/project/messages) predate any real
-- user account, so owner_id starts NULL there. NULL never matches
-- `owner_id = auth.uid()`, so those rows are simply invisible to everyone
-- until claimed -- the trigger below claims them for whichever account
-- signs up first, then never fires again (no NULL rows left to claim).

-- =============================================================================
-- OWNERSHIP COLUMNS
-- =============================================================================

ALTER TABLE twins ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_twins_owner_id ON twins(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);

-- =============================================================================
-- BACKFILL EXISTING (PRE-AUTH) ROWS TO THE FIRST REAL SIGNUP
-- =============================================================================

CREATE OR REPLACE FUNCTION claim_orphaned_rows_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE twins SET owner_id = NEW.id WHERE owner_id IS NULL;
  UPDATE projects SET owner_id = NEW.id WHERE owner_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_claim_orphans ON auth.users;
CREATE TRIGGER on_auth_user_created_claim_orphans
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION claim_orphaned_rows_for_new_user();

-- =============================================================================
-- REPLACE "ALLOW ALL" POLICIES WITH OWNER-SCOPED ONES
-- =============================================================================

DROP POLICY IF EXISTS "Allow all operations on twins for now" ON twins;
DROP POLICY IF EXISTS "Allow all operations on projects for now" ON projects;
DROP POLICY IF EXISTS "Allow all operations on messages for now" ON messages;

-- Twins: a user only sees/manages their own.
CREATE POLICY "Users can view their own twins"
  ON twins FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own twins"
  ON twins FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own twins"
  ON twins FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own twins"
  ON twins FOR DELETE
  USING (owner_id = auth.uid());

-- Projects: same pattern.
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (owner_id = auth.uid());

-- Messages: scoped through the owning project, not their own owner_id.
CREATE POLICY "Users can view messages in their own projects"
  ON messages FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can create messages in their own projects"
  ON messages FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete messages in their own projects"
  ON messages FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()));
