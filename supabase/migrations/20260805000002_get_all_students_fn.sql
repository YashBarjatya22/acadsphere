-- Migration: get_all_students() function
-- Returns ALL registered users (from auth.users) with their profile data.
-- Uses SECURITY DEFINER so it can read auth.users server-side.
-- Falls back to email-derived name for users without a profile entry.

CREATE OR REPLACE FUNCTION public.get_all_students()
RETURNS TABLE (
  id          uuid,
  full_name   text,
  email       text,
  degree      text,
  target_role text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    COALESCE(NULLIF(TRIM(p.full_name), ''), split_part(u.email, '@', 1)) AS full_name,
    u.email,
    COALESCE(p.degree, '')      AS degree,
    COALESCE(p.target_role, '') AS target_role
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.deleted_at IS NULL
    AND u.email IS NOT NULL
  ORDER BY full_name;
$$;

-- Allow any authenticated user to call this function
GRANT EXECUTE ON FUNCTION public.get_all_students() TO authenticated;
