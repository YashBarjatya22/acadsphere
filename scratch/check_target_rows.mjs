import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.resolve("local.db"));
const rows = db.prepare("SELECT * FROM subject_attendance WHERE student_id = 'fa0beb35-7eec-482c-af0b-596dadeb0b79' OR student_id = '00000000-0000-0000-0000-000000000001' OR student_id = 'e3476b5d-e205-5956-942c-bd7622acb35d'").all();
console.log("Recent subject attendance rows:", rows);
