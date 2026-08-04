-- ============================================================
-- SMS Notification System: Phase 1 Schema Migration
-- Creates classroom_tasks cache table + adds phone_number to profiles
-- ============================================================

-- 1. Add phone_number to profiles (nullable, user-set)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT TRUE;

-- 2. classroom_tasks: offline SMS notification cache
CREATE TABLE IF NOT EXISTS public.classroom_tasks (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coursework_id        TEXT        NOT NULL,
  title                TEXT        NOT NULL,
  course_name          TEXT        NOT NULL DEFAULT '',
  due_date             TIMESTAMPTZ,                       -- NULL = no deadline
  status               TEXT        NOT NULL DEFAULT 'PENDING'
                                   CHECK (status IN ('PENDING','COMPLETED')),
  -- Pre-due notification flags (set to TRUE once SMS sent, never reset)
  notified_24h         BOOLEAN     NOT NULL DEFAULT FALSE,
  notified_6h          BOOLEAN     NOT NULL DEFAULT FALSE,
  notified_1h          BOOLEAN     NOT NULL DEFAULT FALSE,
  -- Overdue daily notices
  last_overdue_notice  TIMESTAMPTZ,                       -- NULL = never sent
  -- Audit
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One row per (user, coursework)
  CONSTRAINT classroom_tasks_user_coursework_unique UNIQUE (user_id, coursework_id)
);

-- Indexes for fast cron lookups
CREATE INDEX IF NOT EXISTS classroom_tasks_user_id_idx    ON public.classroom_tasks (user_id);
CREATE INDEX IF NOT EXISTS classroom_tasks_status_idx     ON public.classroom_tasks (status);
CREATE INDEX IF NOT EXISTS classroom_tasks_due_date_idx   ON public.classroom_tasks (due_date);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS classroom_tasks_updated_at ON public.classroom_tasks;
CREATE TRIGGER classroom_tasks_updated_at
  BEFORE UPDATE ON public.classroom_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: each user can only read/write their own tasks
ALTER TABLE public.classroom_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classroom_tasks_user_policy ON public.classroom_tasks;
CREATE POLICY classroom_tasks_user_policy
  ON public.classroom_tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role bypass (required by Edge Function using service_role key)
DROP POLICY IF EXISTS classroom_tasks_service_policy ON public.classroom_tasks;
CREATE POLICY classroom_tasks_service_policy
  ON public.classroom_tasks
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);
