CREATE TABLE public.student_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_progress REAL NOT NULL DEFAULT 0,
  study_consistency REAL NOT NULL DEFAULT 0,
  notes_coverage REAL NOT NULL DEFAULT 0,
  resume_strength REAL NOT NULL DEFAULT 0,
  placement_readiness REAL NOT NULL DEFAULT 0,
  skill_growth REAL NOT NULL DEFAULT 0,
  success_score REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_metrics TO authenticated;
GRANT ALL ON public.student_metrics TO service_role;
ALTER TABLE public.student_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own student metrics" ON public.student_metrics
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX student_metrics_user_id_idx ON public.student_metrics(user_id);

CREATE TRIGGER student_metrics_updated_at
  BEFORE UPDATE ON public.student_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
