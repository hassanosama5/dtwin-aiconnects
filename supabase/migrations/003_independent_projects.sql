-- Decision Twin — Independent Projects
-- Version: 1.0
--
-- Projects are no longer owned by a single Twin. Per the redesigned product
-- flow, a Project is a standalone workspace (title/description/objectives/
-- deadline/stakeholders/constraints/notes) that any of the user's Twins can
-- be consulted about, chosen at chat-time rather than fixed at creation.
--
-- twin_id is kept (not dropped) as an optional "default/suggested twin"
-- hint -- e.g. pre-selecting the picker -- rather than a required binding.
-- ON DELETE SET NULL instead of CASCADE: deleting a Twin should never take
-- a shared Project down with it.

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_twin_id_fkey;
ALTER TABLE projects ALTER COLUMN twin_id DROP NOT NULL;
ALTER TABLE projects
  ADD CONSTRAINT projects_twin_id_fkey
  FOREIGN KEY (twin_id) REFERENCES twins(id) ON DELETE SET NULL;
