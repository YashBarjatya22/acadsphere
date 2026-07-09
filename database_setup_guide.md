# Supabase Database Setup Guide

This guide explains how to initialize and configure your Supabase PostgreSQL database for the premium **StudentOS** university platform.

---

## Step 1: Copy the SQL Schema Script

Navigate to the project migrations folder:
- [studentos_premium_schema.sql](file:///c:/Users/yashb/OneDrive/Pictures/Desktop/spd/supabase/migrations/20260623000000_studentos_premium_schema.sql)

Copy the entire content of that SQL file.

---

## Step 2: Execute in Supabase SQL Editor

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project **icyrztdyrucqmeklgpfs** (or your target project).
3. Click on the **SQL Editor** tab in the left-hand sidebar navigation.
4. Click **New Query** to create a blank editor page.
5. Paste the copied SQL script.
6. Click **Run** to execute the script.

This will instantly build:
- Table structures (`students`, `faculty`, `courses`, `subjects`, `attendance`, `assignments`, `submissions`, `study_materials`, `announcements`, `notifications`, `timetables`, `placements`, `resume_profiles`, `student_activity_logs`).
- Foreign key relations, constraints, check validators, and unique indexes.
- Row Level Security (RLS) policies for Admin, Faculty, and Student roles.
- Triggers linking profile creations to Auth user Signups automatically.

---

## Step 3: Configure Storage Buckets

Navigate to the **Storage** tab in your Supabase Console:

1. Create a public bucket named **`assignment_files`** (for faculty assignments worksheets).
2. Create a public/private bucket named **`submission_files`** (for student homework submissions).
3. Create a public bucket named **`study_materials`** (for slide resources).

Ensure Row Level Security is enabled on the buckets to prevent unauthenticated file reads.

---

## Step 4: Verify RLS Policies & Roles

The schema applies policies where:
- **Students** can read course details, list assignments, submit files to their own assignments, and toggle their own ATS resume profiles.
- **Faculty** can mark student attendance registries, post coursework, grade submissions, and broadcast notices.
- **Admins** maintain full write rights to student registries, designations, courses catalogs, and diagnostic statistics.

*(Note: During development, you can use the **Sim Role Switcher** in the bottom sidebar profile card to change your simulated role dynamically and test each user perspective instantly!)*
