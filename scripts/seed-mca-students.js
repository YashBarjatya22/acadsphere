import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import crypto from "node:crypto";

const dbPath = path.join(process.cwd(), "local.db");
const db = new DatabaseSync(dbPath);

const MCA_CHRIST_STUDENTS = [
  { name: "AADHARSH KRISHNAA G", regNo: "2547201" },
  { name: "ABHINAV JAIN", regNo: "2547203" },
  { name: "AIMEE SUSAN JOSEPH", regNo: "2547204" },
  { name: "AJANYA VINAYAN", regNo: "2547205" },
  { name: "AKASHDEEP DEY", regNo: "2547206" },
  { name: "ALAN SOJAN", regNo: "2547208" },
  { name: "ALBIN THOMAS", regNo: "2547209" },
  { name: "ALOK TAYAL", regNo: "2547210" },
  { name: "AMOGH VENKAT D", regNo: "2547211" },
  { name: "ANAAMIKA KS", regNo: "2547212" },
  { name: "ANGEL BLESSY", regNo: "2547213" },
  { name: "ANNETTE ELIZABETH SHONEY", regNo: "2547216" },
  { name: "ANNIE NEENA A A", regNo: "2547217" },
  { name: "B K VISHNU", regNo: "2547218" },
  { name: "BHAVYA DHANUKA", regNo: "2547219" },
  { name: "DINU DEVEES GEORGE", regNo: "2547220" },
  { name: "EKTA SINGH", regNo: "2547221" },
  { name: "EMIMA J", regNo: "2547222" },
  { name: "ENRITA FERNANDES", regNo: "2547223" },
  { name: "EVAN JOHN MATHEW", regNo: "2547224" },
  { name: "EVANA JOSEPH", regNo: "2547225" },
  { name: "HANNA JOSHY", regNo: "2547226" },
  { name: "I BLESSY", regNo: "2547227" },
  { name: "JAI PAREEK", regNo: "2547228" },
  { name: "KARUN NAGARAJ", regNo: "2547229" },
  { name: "KUHELI BEGUM", regNo: "2547230" },
  { name: "KUNNAL", regNo: "2547231" },
  { name: "MAHAMAT TAHIR SOULEYMANE", regNo: "2547232" },
  { name: "MOHAMMED REHAN SAMIR INAMDAR", regNo: "2547233" },
  { name: "NAMRATHA R", regNo: "2547234" },
  { name: "NIRUPAMA VINCENT", regNo: "2547236" },
  { name: "OMKAAR CHAKRABORTY", regNo: "2547237" },
  { name: "PAAVAN GUPTA", regNo: "2547238" },
  { name: "PRAJWAL KT", regNo: "2547239" },
  { name: "PRANAV M R", regNo: "2547240" },
  { name: "R KARAN", regNo: "2547241" },
  { name: "RAHUL MOHAN GUPTA", regNo: "2547242" },
  { name: "RISHI RAJ", regNo: "2547243" },
  { name: "ROY MATHEW", regNo: "2547244" },
  { name: "SACHIN KUMAR D", regNo: "2547245" },
  { name: "SAURABH BURNWAL", regNo: "2547246" },
  { name: "SHARON MATHEW", regNo: "2547247" },
  { name: "SLAVEN DERICK PAIS", regNo: "2547249" },
  { name: "SNEHA VARGHESE", regNo: "2547250" },
  { name: "SUDEEPA SANTHANAM", regNo: "2547252" },
  { name: "VARUN SINGH", regNo: "2547254" },
  { name: "VISHWAS VASHISHTHA", regNo: "2547255" },
  { name: "XAVIER AMITH J", regNo: "2547256" },
  { name: "ANANYA M", regNo: "2547259" },
  { name: "MISTRY JAMIS KIRITKUMAR", regNo: "2547260" },
  { name: "MANIARASAN J", regNo: "2547261" },
  { name: "ANUSHKA SINGH", regNo: "2547262" }
];

function formatStudentEmail(name) {
  const formattedName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".");
  return `${formattedName}@mca.christuniversity.in`;
}

console.log("Starting MCA Christ University Student Database Seeding...");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'student',
    degree TEXT,
    target_role TEXT,
    current_skills TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    department TEXT DEFAULT 'MCA',
    semester TEXT DEFAULT 'Semester 4',
    section TEXT DEFAULT 'A',
    phone TEXT DEFAULT '',
    cgpa REAL DEFAULT 8.5,
    attendance_percentage REAL DEFAULT 90.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS student_metrics (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    roadmap_progress REAL DEFAULT 0,
    study_consistency REAL DEFAULT 0,
    notes_coverage REAL DEFAULT 0,
    resume_strength REAL DEFAULT 0,
    placement_readiness REAL DEFAULT 0,
    skill_growth REAL DEFAULT 0,
    success_score REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subject_attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    classes_attended INTEGER DEFAULT 0,
    classes_conducted INTEGER DEFAULT 0,
    attendance_percentage REAL DEFAULT 100.0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id)
  );
`);

// Delete dummy non-admin users
db.exec(`
  DELETE FROM users WHERE email != 'admin@gmail.com';
  DELETE FROM profiles WHERE id NOT IN (SELECT id FROM users);
  DELETE FROM students WHERE id NOT IN (SELECT id FROM users);
  DELETE FROM student_metrics WHERE user_id NOT IN (SELECT id FROM users);
  DELETE FROM subject_attendance WHERE student_id NOT IN (SELECT id FROM users);
`);

const insertUser = db.prepare("INSERT OR REPLACE INTO users (id, email, password_hash, status) VALUES (?, ?, ?, 'active')");
const insertProfile = db.prepare("INSERT OR REPLACE INTO profiles (id, full_name, role, degree, target_role) VALUES (?, ?, 'student', 'MCA', 'Software Engineer')");
const insertStudent = db.prepare("INSERT OR REPLACE INTO students (id, student_id, department, semester, section, phone, cgpa, attendance_percentage) VALUES (?, ?, 'MCA', 'Semester 4', 'A', ?, ?, ?)");
const insertMetrics = db.prepare("INSERT OR REPLACE INTO student_metrics (id, user_id, roadmap_progress, study_consistency, notes_coverage, resume_strength, placement_readiness, skill_growth, success_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertSubAtt = db.prepare("INSERT OR REPLACE INTO subject_attendance (id, student_id, subject_id, subject_name, subject_code, classes_attended, classes_conducted, attendance_percentage) VALUES (?, ?, ?, ?, ?, ?, 50, ?)");

const defaultSubjects = [
  { id: "sub1", name: "Database Management Systems", code: "CS301" },
  { id: "sub2", name: "Operating Systems", code: "CS302" },
  { id: "sub3", name: "Computer Networks", code: "CS303" },
  { id: "sub4", name: "Artificial Intelligence", code: "CS304" },
  { id: "sub5", name: "Software Engineering", code: "CS305" },
];

let insertedCount = 0;

for (const s of MCA_CHRIST_STUDENTS) {
  const email = formatStudentEmail(s.name);
  const pwHash = crypto.createHash("sha256").update(s.regNo).digest("hex");
  const userId = crypto.createHash("md5").update(email).digest("hex").replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");

  const phone = `+91 98765${s.regNo.slice(-5)}`;
  const regNum = parseInt(s.regNo.slice(-2), 10);
  const cgpa = Number((7.5 + (regNum % 25) / 10).toFixed(2));
  const overallAtt = 72 + (regNum % 25);

  insertUser.run(userId, email, pwHash);
  insertProfile.run(userId, s.name);
  insertStudent.run(userId, s.regNo, phone, cgpa, overallAtt);
  insertMetrics.run(
    crypto.randomUUID(),
    userId,
    65 + (regNum % 30),
    80, 75, 85, 80, 78, 82
  );

  for (const sub of defaultSubjects) {
    const subAttended = Math.min(50, Math.max(32, Math.round(50 * (overallAtt / 100))));
    const subPct = Math.round((subAttended / 50) * 100);
    insertSubAtt.run(crypto.randomUUID(), userId, sub.id, sub.name, sub.code, subAttended, subPct);
  }

  insertedCount++;
  console.log(`[${insertedCount}/52] Seeded: ${s.name} | ${email} | Reg: ${s.regNo}`);
}

console.log("\n==========================================");
console.log(`Successfully seeded ALL ${insertedCount} MCA Christ University student accounts!`);
console.log("==========================================");
