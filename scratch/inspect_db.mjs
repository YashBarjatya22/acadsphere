import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.resolve("local.db"));

// Check all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables in local.db:", tables);

// Check distinct student_ids in subject_attendance
const studentIds = db.prepare("SELECT DISTINCT student_id FROM subject_attendance").all();
console.log("Student IDs in subject_attendance:", studentIds);
