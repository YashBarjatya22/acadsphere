import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.resolve("local.db"));
const users = db.prepare("SELECT * FROM users").all();
console.log("Users in local.db:", users);

const profiles = db.prepare("SELECT * FROM profiles").all();
console.log("Profiles in local.db:", profiles);

const students = db.prepare("SELECT id, name, register_number, email FROM students LIMIT 10").all();
console.log("Students sample in local.db:", students);
