# StudentOS — Academic SaaS Platform

StudentOS is a premium, university-grade academic management and AI mentoring platform designed for MCA, BCA, and B.Tech students. It combines registry management, coursework evaluation, study material catalogs, and advanced AI study partnerships into a single, unified interface.

---

## 🚀 Key Modules & Features

1. **Integrated Command Center**: Multi-role dashboards custom-tailored for **Students** (GPA graphs, streaks, timelines), **Faculty** (average grades, completions lists, histograms), and **Admins** (diagnostic logs, department distribution).
2. **Student Registry System**: Complete student database management supporting rolling admissions (Add/Edit/Delete), ID indexing, department and semester filters, and batch CSV logs export.
3. **Attendance Ledger**: Daily lecture roll-call sheet. Faculty can mark student statuses (Present/Absent/Late), which immediately updates student analytics cards and eligibility indicators.
4. **Assignments Board**: Homework posting desk for faculty, supporting simulated document uploads for student homework submissions and graded evaluations.
5. **Study Notes Vault**: Cataloged slides, previous term papers, and cheat sheets organized by subject folders with favorites/bookmarks lists.
6. **Announcements Broadcaster**: High-priority broadcasts from department faculties immediately synced to all student alert histories.
7. **AI Academic Partner**: Seeding prompt templates for explaining complex CS topics, generating revision flashcards, or compiling mock quizzes.
8. **Student Utilities Suite**: Pomodoro focus timer with logged hours tracker, Placement job application board with status stages, and ATS resume builder with active audit suggestions.

---

## 🛠 Tech Stack

- **Frontend Framework**: React 19 + TypeScript + Vite
- **Routing & State**: TanStack Router + TanStack Query + TanStack Start (SSR capability)
- **Styling & Components**: Tailwind CSS + ShadCN UI + Recharts (Interactive charts)
- **Database / Auth**: Supabase (PostgreSQL, Supabase Auth, Storage and Realtime triggers)
- **Local Fallback**: Node SQLite (`local.db`) for full local parity without active internet connections.

---

## 💻 Local Setup

1. **Install Node Packages**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables (`.env`)**:
   Ensure your `.env` contains the required keys:
   ```env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   SUPABASE_URL="https://your-project-id.supabase.co"
   SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   ```

3. **Install Python Requirements (For paper/file parsing)**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   The site will load locally at `http://localhost:8080`.

---

## 📁 Database Schema Setup

To create the database structure on your Supabase instance, please review the [Database Setup Guide](file:///c:/Users/yashb/OneDrive/Pictures/Desktop/spd/database_setup_guide.md) and copy the SQL script inside [studentos_premium_schema.sql](file:///c:/Users/yashb/OneDrive/Pictures/Desktop/spd/supabase/migrations/20260623000000_studentos_premium_schema.sql) into the Supabase Console SQL Editor.
