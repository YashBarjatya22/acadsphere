-- Migration to create the complete relational schema for StudentOS premium university platform.

-- 1. Ensure profiles has the role and avatar fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to authenticated users" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to courses" ON public.courses FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 3. Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  semester TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow admin/faculty write access to subjects" ON public.subjects FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty'))
);

-- 4. Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT NOT NULL,
  semester TEXT NOT NULL,
  section TEXT NOT NULL,
  cgpa NUMERIC DEFAULT 0.0,
  attendance_percentage NUMERIC DEFAULT 100.0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select on students to all authenticated" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow write on students to admin or self" ON public.students FOR ALL TO authenticated USING (
  auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 5. Create faculty table
CREATE TABLE IF NOT EXISTS public.faculty (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  faculty_id TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  designation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select on faculty to all authenticated" ON public.faculty FOR SELECT USING (true);
CREATE POLICY "Allow write on faculty to admin" ON public.faculty FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 6. Create attendance table and logs
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, subject_id, date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow students to view own attendance" ON public.attendance FOR SELECT USING (
  auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty'))
);
CREATE POLICY "Allow faculty/admin to manage attendance" ON public.attendance FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty'))
);

-- 7. Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  file_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Allow faculty/admin to manage assignments" ON public.assignments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty'))
);

-- 8. Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  file_url TEXT,
  grade TEXT,
  feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow students to view/submit own submissions" ON public.submissions FOR ALL USING (
  auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty'))
);

-- 9. Create study_materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anyone to view study materials" ON public.study_materials FOR SELECT USING (true);
CREATE POLICY "Allow upload study materials" ON public.study_materials FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty'))
);

-- 10. Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.study_materials(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, material_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- 11. Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT DEFAULT 'general' CHECK (category IN ('academic', 'event', 'placement', 'general')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow write announcements to admin/faculty" ON public.announcements FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty'))
);

-- 12. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- 13. Create timetables table
CREATE TABLE IF NOT EXISTS public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read own timetable" ON public.timetables FOR SELECT USING (
  auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty'))
);
CREATE POLICY "Allow write to timetables" ON public.timetables FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 14. Create placements table
CREATE TABLE IF NOT EXISTS public.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('applied', 'interviewing', 'offered', 'rejected')),
  applied_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow student read/write own placements" ON public.placements FOR ALL USING (
  auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'faculty'))
);

-- 15. Create resume_profiles table
CREATE TABLE IF NOT EXISTS public.resume_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary TEXT,
  education JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  projects JSONB DEFAULT '[]',
  ats_score INTEGER DEFAULT 0,
  suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.resume_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read/write own resume" ON public.resume_profiles FOR ALL USING (auth.uid() = id);

-- 16. Create student_activity_logs table
CREATE TABLE IF NOT EXISTS public.student_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- e.g., 'pomodoro', 'study_streak', 'login'
  duration_minutes INTEGER DEFAULT 0,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.student_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow manage own activities" ON public.student_activity_logs FOR ALL USING (auth.uid() = user_id);

-- Create index columns for optimized querying
CREATE INDEX IF NOT EXISTS attendance_student_idx ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS submissions_assignment_idx ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS announcements_priority_idx ON public.announcements(priority);
CREATE INDEX IF NOT EXISTS timetables_student_idx ON public.timetables(student_id);
CREATE INDEX IF NOT EXISTS placements_student_idx ON public.placements(student_id);
