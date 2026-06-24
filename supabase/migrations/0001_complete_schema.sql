-- COMPLETE SCHEMA MIGRATION FOR STUDENT OS
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  degree TEXT,
  semester TEXT,
  target_role TEXT,
  current_skills JSONB,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. student_metrics
CREATE TABLE IF NOT EXISTS public.student_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_progress REAL DEFAULT 0,
  study_consistency REAL DEFAULT 0,
  notes_coverage REAL DEFAULT 0,
  resume_strength REAL DEFAULT 0,
  placement_readiness REAL DEFAULT 0,
  skill_growth REAL DEFAULT 0,
  success_score REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. student_events
CREATE TABLE IF NOT EXISTS public.student_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'ROADMAP_MILESTONE_COMPLETED',
    'STUDY_TASK_COMPLETED',
    'NOTES_ANALYZED',
    'PAPER_ANALYZED',
    'RESUME_ANALYZED',
    'CHAT_COMPLETED',
    'PROFILE_UPDATED'
  )),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS student_events_user_id_idx ON public.student_events(user_id);
CREATE INDEX IF NOT EXISTS student_events_created_at_idx ON public.student_events(created_at);

-- 4. student_activities
CREATE TABLE IF NOT EXISTS public.student_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  subject TEXT,
  duration_minutes INTEGER,
  score INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. threads
CREATE TABLE IF NOT EXISTS public.threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New chat',
  module TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  parts JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. knowledge_profile
CREATE TABLE IF NOT EXISTS public.knowledge_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('roadmap', 'paper', 'notes', 'study')),
  confidence REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS knowledge_profile_user_id_idx ON public.knowledge_profile(user_id);

-- 8. career_roadmaps
CREATE TABLE IF NOT EXISTS public.career_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  timeline_months INTEGER NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. study_plans
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  semester TEXT NOT NULL,
  subjects JSONB NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. study_tasks
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.study_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. paper_analyses
CREATE TABLE IF NOT EXISTS public.paper_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT,
  num_pages INTEGER,
  status TEXT NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. notes_analyses
CREATE TABLE IF NOT EXISTS public.notes_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT,
  num_pages INTEGER,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. resume_analyses
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT,
  job_description TEXT NOT NULL,
  ats_score INTEGER,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tech_stack JSONB,
  github_url TEXT,
  live_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. internships
CREATE TABLE IF NOT EXISTS public.internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT,
  date_earned TIMESTAMPTZ,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Helper to quickly apply standard policies
-- Note: Supabase requires individual policy definitions

-- 1. profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. student_metrics
CREATE POLICY "Users can view own metrics" ON public.student_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own metrics" ON public.student_metrics FOR UPDATE USING (auth.uid() = user_id);

-- 3. student_events
CREATE POLICY "Users can view own events" ON public.student_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.student_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. student_activities
CREATE POLICY "Users can view own activities" ON public.student_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON public.student_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. threads
CREATE POLICY "Users can manage own threads" ON public.threads FOR ALL USING (auth.uid() = user_id);

-- 6. messages
CREATE POLICY "Users can manage own messages" ON public.messages FOR ALL USING (auth.uid() = user_id);

-- 7. knowledge_profile
CREATE POLICY "Users can manage own knowledge" ON public.knowledge_profile FOR ALL USING (auth.uid() = user_id);

-- 8. career_roadmaps
CREATE POLICY "Users can manage own roadmaps" ON public.career_roadmaps FOR ALL USING (auth.uid() = user_id);

-- 9. study_plans
CREATE POLICY "Users can manage own study plans" ON public.study_plans FOR ALL USING (auth.uid() = user_id);

-- 10. study_tasks
CREATE POLICY "Users can manage own study tasks" ON public.study_tasks FOR ALL USING (auth.uid() = user_id);

-- 11. paper_analyses
CREATE POLICY "Users can manage own paper analyses" ON public.paper_analyses FOR ALL USING (auth.uid() = user_id);

-- 12. notes_analyses
CREATE POLICY "Users can manage own notes analyses" ON public.notes_analyses FOR ALL USING (auth.uid() = user_id);

-- 13. resume_analyses
CREATE POLICY "Users can manage own resume analyses" ON public.resume_analyses FOR ALL USING (auth.uid() = user_id);

-- 14. projects
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);

-- 15. internships
CREATE POLICY "Users can manage own internships" ON public.internships FOR ALL USING (auth.uid() = user_id);

-- 16. achievements
CREATE POLICY "Users can manage own achievements" ON public.achievements FOR ALL USING (auth.uid() = user_id);

-- AUTOMATIC PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  -- Insert default metrics for new user
  INSERT INTO public.student_metrics (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('academic_papers', 'academic_papers', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('study_notes', 'study_notes', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', false) ON CONFLICT DO NOTHING;

-- STORAGE POLICIES
-- Resumes
CREATE POLICY "Users can manage own resumes" ON storage.objects FOR ALL USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Academic Papers
CREATE POLICY "Users can manage own papers" ON storage.objects FOR ALL USING (
  bucket_id = 'academic_papers' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Study Notes
CREATE POLICY "Users can manage own notes" ON storage.objects FOR ALL USING (
  bucket_id = 'study_notes' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Projects
CREATE POLICY "Users can manage own projects assets" ON storage.objects FOR ALL USING (
  bucket_id = 'projects' AND auth.uid()::text = (storage.foldername(name))[1]
);
