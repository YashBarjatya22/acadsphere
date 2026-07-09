// @ts-ignore
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import dns from "node:dns";

// DNS patch to bypass local getaddrinfo failures for Supabase domain
const originalLookup = dns.lookup;
dns.lookup = function (hostname: string, options: any, callback: any) {
  if (hostname === "icyrztdyrucqmeklgpfs.supabase.co") {
    const cb = typeof options === "function" ? options : callback;
    const opts = typeof options === "object" ? options : {};
    const ip = "172.67.75.143";
    if (cb) {
      if (opts.all) {
        cb(null, [{ address: ip, family: 4 }]);
      } else {
        cb(null, ip, 4);
      }
      return;
    }
  }
  return originalLookup.apply(this, arguments as any);
} as any;

let db: any;

try {
  // Store db in the workspace directory
  const dbPath = path.join(process.cwd(), "local.db");
  db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT,
      degree TEXT,
      target_role TEXT,
      current_skills TEXT, -- JSON string representation of list
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_metrics (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      roadmap_progress REAL DEFAULT 0,
      study_consistency REAL DEFAULT 0,
      notes_coverage REAL DEFAULT 0,
      resume_strength REAL DEFAULT 0,
      placement_readiness REAL DEFAULT 0,
      skill_growth REAL DEFAULT 0,
      success_score REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS knowledge_profile (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      concept TEXT NOT NULL,
      source TEXT NOT NULL CHECK (source IN ('roadmap', 'paper', 'notes', 'study')),
      confidence REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS knowledge_profile_user_id_idx ON knowledge_profile (user_id);

    CREATE TABLE IF NOT EXISTS student_events (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL CHECK (event_type IN (
        'ROADMAP_MILESTONE_COMPLETED',
        'STUDY_TASK_COMPLETED',
        'NOTES_ANALYZED',
        'PAPER_ANALYZED',
        'RESUME_ANALYZED',
        'CHAT_COMPLETED'
      )),
      payload TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS student_events_user_id_idx ON student_events (user_id);
    CREATE INDEX IF NOT EXISTS student_events_created_at_idx ON student_events (created_at);

    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT DEFAULT 'New chat',
      module TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT REFERENCES threads(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      parts TEXT NOT NULL, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS paper_analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      num_pages INTEGER,
      status TEXT NOT NULL,
      result TEXT, -- JSON string representing all AI results
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      degree TEXT NOT NULL,
      semester TEXT NOT NULL,
      subjects TEXT NOT NULL, -- JSON string representation
      result TEXT, -- JSON string representation of AI plan
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS study_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      plan_id TEXT REFERENCES study_plans(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes_analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      num_pages INTEGER,
      subject TEXT NOT NULL,
      status TEXT NOT NULL,
      result TEXT, -- JSON string representing AI report results
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_activities (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL, -- 'study_session', 'milestone', 'skill', 'streak'
      subject TEXT,
      duration_minutes INTEGER,
      score INTEGER,
      details TEXT, -- JSON string representing stats or metadata
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("[SQLite] Database initialized successfully at:", dbPath);
} catch (error) {
  console.error("[SQLite] Failed to initialize database:", error);
}

export function getDb() {
  return db;
}

import { createClient } from "@supabase/supabase-js";

let supabaseServerClient: any = null;

export function getSupabaseServerClient() {
  if (supabaseServerClient) return supabaseServerClient;
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (supabaseUrl && supabaseKey) {
    try {
      supabaseServerClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });
      return supabaseServerClient;
    } catch (e) {
      console.warn("[Supabase Client Init Error]", e);
    }
  }
  return null;
}

