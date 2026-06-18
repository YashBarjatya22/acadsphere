CREATE TABLE public.student_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'ROADMAP_MILESTONE_COMPLETED',
    'STUDY_TASK_COMPLETED',
    'NOTES_ANALYZED',
    'PAPER_ANALYZED',
    'RESUME_ANALYZED',
    'CHAT_COMPLETED'
  )),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_events TO authenticated;
GRANT ALL ON public.student_events TO service_role;
ALTER TABLE public.student_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own student events" ON public.student_events
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX student_events_user_id_idx ON public.student_events(user_id);
CREATE INDEX student_events_created_at_idx ON public.student_events(created_at);
