-- Decision Twin Database Schema
-- Version: 1.0
-- Date: 2025-01-27

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- Twins table
-- Stores Decision Twin metadata and personal profiles
CREATE TABLE IF NOT EXISTS twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  personal_profile JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects table
-- Stores project-specific context for each twin
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  project_profile JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
-- Stores conversation history
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_twin_id ON projects(twin_id);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_twins_created_at ON twins(created_at DESC);

-- JSONB indexes for profile queries (optional, add if needed)
-- CREATE INDEX IF NOT EXISTS idx_personal_profile_gin ON twins USING GIN (personal_profile);
-- CREATE INDEX IF NOT EXISTS idx_project_profile_gin ON projects USING GIN (project_profile);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE twins ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- For MVP: Allow all operations (no auth yet)
-- These policies will be replaced when authentication is added

-- Twins policies
CREATE POLICY "Allow all operations on twins for now"
  ON twins
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Projects policies
CREATE POLICY "Allow all operations on projects for now"
  ON projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Messages policies
CREATE POLICY "Allow all operations on messages for now"
  ON messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- FUTURE: Authentication-based RLS policies
-- =============================================================================
-- Uncomment and modify these when adding authentication:

-- DROP POLICY "Allow all operations on twins for now" ON twins;
--
-- CREATE POLICY "Users can view all twins"
--   ON twins FOR SELECT
--   USING (true);
--
-- CREATE POLICY "Users can create their own twins"
--   ON twins FOR INSERT
--   WITH CHECK (auth.uid() IS NOT NULL);
--
-- CREATE POLICY "Users can update their own twins"
--   ON twins FOR UPDATE
--   USING (owner_id = auth.uid())  -- Add owner_id column when implementing auth
--   WITH CHECK (owner_id = auth.uid());
--
-- CREATE POLICY "Users can delete their own twins"
--   ON twins FOR DELETE
--   USING (owner_id = auth.uid());

-- =============================================================================
-- HELPER FUNCTIONS (Optional)
-- =============================================================================

-- Function to get recent messages for a project
CREATE OR REPLACE FUNCTION get_recent_messages(
  p_project_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  role TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.project_id, m.role, m.content, m.metadata, m.created_at
  FROM messages m
  WHERE m.project_id = p_project_id
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SEED DATA (Optional - for testing)
-- =============================================================================

-- Uncomment to create sample data:
-- INSERT INTO twins (name, role, avatar_url, personal_profile) VALUES
-- (
--   'Hassan Osama',
--   'Project Manager',
--   null,
--   '{"name":"Hassan Osama","role":"Project Manager","leadershipStyle":"Collaborative","communicationStyle":"Direct","decisionStyle":"Data Driven","values":["Security","Customer First","Honesty"],"delegationRules":["Developers can decide implementation details"],"approvalRules":["Timeline changes require approval"]}'::jsonb
-- );
