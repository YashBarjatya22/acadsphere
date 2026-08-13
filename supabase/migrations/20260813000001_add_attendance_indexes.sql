-- Migration: Add performance index on student_attendance.user_id
-- This speeds up the Supabase query and real-time filter used by the attendance UI.
CREATE INDEX IF NOT EXISTS idx_student_attendance_user_id
    ON public.student_attendance (user_id);

-- Also add an index on last_synced_at for ordering queries
CREATE INDEX IF NOT EXISTS idx_student_attendance_synced_at
    ON public.student_attendance (last_synced_at DESC);
