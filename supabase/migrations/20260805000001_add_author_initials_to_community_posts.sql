-- Fix: Add missing author_initials column to community_posts table
-- This column was defined in 20260804000001_community_chat.sql but may not have
-- been applied if the table already existed without it.

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS author_initials TEXT NOT NULL DEFAULT '';
