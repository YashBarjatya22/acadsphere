-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  degree TEXT,
  target_role TEXT,
  current_skills JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDENT METRICS
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

-- KNOWLEDGE PROFILE
CREATE TABLE IF NOT EXISTS public.knowledge_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('roadmap', 'paper', 'notes', 'study')),
  confidence REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS knowledge_profile_user_id_idx ON public.knowledge_profile(user_id);

-- STUDENT EVENTS
CREATE TABLE IF NOT EXISTS public.student_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'ROADMAP_MILESTONE_COMPLETED',
    'STUDY_TASK_COMPLETED',
    'NOTES_ANALYZED',
    'PAPER_ANALYZED',
    'RESUME_ANALYZED',
    'CHAT_COMPLETED'
  )),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS student_events_user_id_idx ON public.student_events(user_id);
CREATE INDEX IF NOT EXISTS student_events_created_at_idx ON public.student_events(created_at);

-- THREADS
CREATE TABLE IF NOT EXISTS public.threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New chat',
  module TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  parts JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAPER ANALYSES
CREATE TABLE IF NOT EXISTS public.paper_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  num_pages INTEGER,
  status TEXT NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDY PLANS
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  semester TEXT NOT NULL,
  subjects JSONB NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDY TASKS
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.study_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTES ANALYSES
CREATE TABLE IF NOT EXISTS public.notes_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  num_pages INTEGER,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDENT ACTIVITIES
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

-- Row Level Security (RLS) Configuration

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.student_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own metrics." ON public.student_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own metrics." ON public.student_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own metrics." ON public.student_metrics FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.knowledge_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own knowledge profile." ON public.knowledge_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own knowledge profile." ON public.knowledge_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own knowledge profile." ON public.knowledge_profile FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.student_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own events." ON public.student_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events." ON public.student_events FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own threads." ON public.threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own threads." ON public.threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own threads." ON public.threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own threads." ON public.threads FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own messages." ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own messages." ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.paper_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own paper analyses." ON public.paper_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own paper analyses." ON public.paper_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own paper analyses." ON public.paper_analyses FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own study plans." ON public.study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own study plans." ON public.study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study plans." ON public.study_plans FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own study tasks." ON public.study_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own study tasks." ON public.study_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study tasks." ON public.study_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study tasks." ON public.study_tasks FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.notes_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notes analyses." ON public.notes_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes analyses." ON public.notes_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes analyses." ON public.notes_analyses FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own activities." ON public.student_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities." ON public.student_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activities." ON public.student_activities FOR UPDATE USING (auth.uid() = user_id);

-- Create a trigger to automatically create a profile for new users
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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
