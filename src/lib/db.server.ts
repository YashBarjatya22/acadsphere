// @ts-ignore
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

let db: any;

try {
  // Store db in the workspace directory
  const dbPath = path.join(process.cwd(), "local.db");
  db = new DatabaseSync(dbPath);

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
