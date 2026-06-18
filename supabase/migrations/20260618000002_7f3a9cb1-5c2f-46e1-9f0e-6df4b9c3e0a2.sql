CREATE TABLE public.knowledge_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('roadmap', 'paper', 'notes', 'study')),
  confidence REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_profile TO authenticated;
GRANT ALL ON public.knowledge_profile TO service_role;
ALTER TABLE public.knowledge_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own knowledge profile" ON public.knowledge_profile
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX knowledge_profile_user_id_idx ON public.knowledge_profile(user_id);
