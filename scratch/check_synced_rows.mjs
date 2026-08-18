import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.resolve("local.db"));
const rows = db.prepare("SELECT * FROM subject_attendance").all();
console.log("All rows in subject_attendance:", rows);
