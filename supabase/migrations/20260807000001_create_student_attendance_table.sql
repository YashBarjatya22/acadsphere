-- Migration: Create student_attendance table for CUE Portal sync ingestion
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    subject_type TEXT DEFAULT 'Theory',
    attended_classes INTEGER DEFAULT 0,
    total_classes INTEGER DEFAULT 0,
    percentage DOUBLE PRECISION DEFAULT 100.0,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT student_attendance_user_subject_key UNIQUE (user_id, subject_code)
);

-- Enable RLS
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read & write for extension ingestion
CREATE POLICY "Allow public read on student_attendance"
    ON public.student_attendance FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert/update on student_attendance"
    ON public.student_attendance FOR ALL
    USING (true)
    WITH CHECK (true);
