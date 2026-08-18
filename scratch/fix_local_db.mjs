import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.resolve("local.db"));

// 1. Delete old fake seed subjects
db.prepare("DELETE FROM subject_attendance WHERE student_id = '00000000-0000-0000-0000-000000000001'").run();

// 2. Query what's in fa0beb35
const userRows = db.prepare("SELECT * FROM subject_attendance WHERE student_id = 'fa0beb35-7eec-482c-af0b-596dadeb0b79'").all();
console.log("Existing user rows:", userRows.length);

// 3. Clone user's real rows to default fallback so dashboard always shows real subjects
const upsertStmt = db.prepare(`
  INSERT INTO subject_attendance 
  (id, student_id, subject_id, subject_name, subject_code, classes_attended, classes_conducted, attendance_percentage, last_updated)
  VALUES (?, '00000000-0000-0000-0000-000000000001', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(student_id, subject_id) DO UPDATE SET
    subject_name = excluded.subject_name,
    classes_attended = excluded.classes_attended,
    classes_conducted = excluded.classes_conducted,
    attendance_percentage = excluded.attendance_percentage,
    last_updated = CURRENT_TIMESTAMP
`);

for (const row of userRows) {
  upsertStmt.run(crypto.randomUUID(), row.subject_id, row.subject_name, row.subject_code, row.classes_attended, row.classes_conducted, row.attendance_percentage);
}

console.log("Updated default fallback with real subjects.");
