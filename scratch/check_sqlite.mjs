import { getDb } from "./src/lib/db.server.js";

async function run() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM subject_attendance").all();
  console.log("Subject attendance rows count:", rows.length);
  console.log("Rows:", rows);
}
run();
