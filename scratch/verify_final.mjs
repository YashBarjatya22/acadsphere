import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.resolve("local.db"));
const rows = db.prepare("SELECT * FROM subject_attendance WHERE student_id = 'fa0beb35-7eec-482c-af0b-596dadeb0b79'").all();
console.log("Subjects in local.db for active student:");
console.table(rows.map(r => ({
  Subject: r.subject_name,
  Code: r.subject_code,
  Attended: r.classes_attended,
  Total: r.classes_conducted,
  Percentage: `${r.attendance_percentage}%`
})));
