-- Community Chat Schema
-- Shared community posts visible to ALL authenticated users
-- Groups feature with membership

-- 1. community_posts table (shared across all users)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_initials TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS community_posts_created_at_idx ON public.community_posts(created_at DESC);

-- 2. community_post_likes (track per-user likes to prevent double-liking)
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- 3. community_groups table
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. community_group_members (who's in each group)
CREATE TABLE IF NOT EXISTS public.community_group_members (
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: ALL authenticated users can see ALL community posts
CREATE POLICY "Anyone authenticated can view community posts"
  ON public.community_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert community posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own community posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Anyone authenticated can view likes"
  ON public.community_post_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert likes"
  ON public.community_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.community_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Groups policies
CREATE POLICY "Anyone authenticated can view groups"
  ON public.community_groups FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create groups"
  ON public.community_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creator can update group"
  ON public.community_groups FOR UPDATE
  USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Anyone authenticated can view group members"
  ON public.community_group_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can join groups"
  ON public.community_group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.community_group_members FOR DELETE
  USING (auth.uid() = user_id);

-- Fix profiles RLS: allow ALL authenticated users to read ALL profiles
-- (needed for classmates list to work for everyone)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Enable Realtime on community_posts for live updates across all sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_group_members;
