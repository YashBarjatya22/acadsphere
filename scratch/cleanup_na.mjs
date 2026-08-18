import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.resolve("local.db"));
db.prepare("DELETE FROM subject_attendance WHERE subject_name = 'N/A' OR subject_code = 'N/A' OR subject_id = 'cue-n_a'").run();
console.log("Deleted invalid N/A rows.");
