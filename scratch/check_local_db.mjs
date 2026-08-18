import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const dbPath = path.resolve("local.db");
console.log("Opening db at:", dbPath);
const db = new DatabaseSync(dbPath);

try {
  const rows = db.prepare("SELECT * FROM subject_attendance").all();
  console.log("Count:", rows.length);
  console.log("Rows:", rows);
} catch (e) {
  console.error("Error reading table:", e.message);
}
