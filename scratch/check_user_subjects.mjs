import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.resolve("local.db"));
const rows = db.prepare("SELECT * FROM subject_attendance WHERE student_id = 'fa0beb35-7eec-482c-af0b-596dadeb0b79'").all();
console.log("Rows for user fa0beb35:", rows);
