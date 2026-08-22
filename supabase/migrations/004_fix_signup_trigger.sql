-- Decision Twin — Fix Sign-Up Trigger
-- Version: 1.0
--
-- migration 002's claim_orphaned_rows_for_new_user() trigger was breaking
-- EVERY sign-up with "Database error saving new user" (500). Root cause:
-- as a SECURITY DEFINER function, its search_path does not reliably include
-- `public`, so the unqualified references to `twins`/`projects` failed to
-- resolve — Postgres raised "relation does not exist", which GoTrue
-- surfaces to the client as a generic, unhelpful 500 instead of the real
-- error. Confirmed by reproducing the failure against the live project
-- (two separate sign-up attempts, both 500, same generic message) before
-- writing this fix.
--
-- Fixes:
--   1. Schema-qualify every table reference (public.twins, public.projects)
--      so resolution doesn't depend on search_path at all.
--   2. Wrap the backfill in EXCEPTION handling: a one-time convenience
--      backfill must never be allowed to block the core sign-up flow again,
--      no matter what else changes about these tables later. A failure here
--      is logged (via RAISE WARNING, visible in Supabase's Postgres logs)
--      and swallowed, not re-raised.

CREATE OR REPLACE FUNCTION claim_orphaned_rows_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    UPDATE public.twins SET owner_id = NEW.id WHERE owner_id IS NULL;
    UPDATE public.projects SET owner_id = NEW.id WHERE owner_id IS NULL;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'claim_orphaned_rows_for_new_user failed for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
