import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Use process.cwd() assuming script is run from project root
const envPath = path.resolve(process.cwd(), '.env.local');

dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase environment variables in .env.local");
  console.error("Ensure NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface StudentRow {
  register_number: string;
  student_name: string;
  email: string;
}

interface ReportRow {
  register_number: string;
  student_name: string;
  email: string;
  status: string;
  error_message: string;
}

function generateEmail(name: string): string {
  const cleanName = name.trim().toLowerCase().replace(/\s+/g, ' ');
  const parts = cleanName.split(' ');
  
  if (parts.length === 1) {
    return `${parts[0]}.${parts[0]}@mca.christuniversity.in`;
  }
  
  // As per instructions, firstname.lastname
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  
  return `${firstName}.${lastName}@mca.christuniversity.in`;
}

async function importStudents() {
  console.log("🚀 Starting Student Import Process\n");
  
  const csvFilePath = path.resolve(process.cwd(), 'students.csv');
  const reportFilePath = path.resolve(process.cwd(), 'import-report.csv');
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ Input file not found: ${csvFilePath}`);
    process.exit(1);
  }

  // 1. Read existing users to prevent duplicates
  console.log("Fetching existing users from Supabase...");
  const existingEmails = new Set<string>();
  
  try {
    let hasMore = true;
    let page = 1;
    while (hasMore) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      
      data.users.forEach((u: any) => {
        if (u.email) existingEmails.add(u.email.toLowerCase());
      });
      
      if (data.users.length < 1000) {
        hasMore = false;
      } else {
        page++;
      }
    }
    console.log(`Found ${existingEmails.size} existing users.\n`);
  } catch (error) {
    console.error("❌ Failed to fetch existing users:", error);
    process.exit(1);
  }

  // 2. Parse CSV
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Assuming first row is header: register_number,student_name,email
  const headers = lines[0].split(',');
  const studentRecords: StudentRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    // Extract columns safely, handling possible empty columns at the end
    const register_number = cols[0]?.trim() || '';
    const student_name = cols[1]?.trim() || '';
    const raw_email = cols.slice(2).join(',').trim(); // Join remaining in case of commas, though standard CSV handles differently
    
    if (register_number && student_name) {
      studentRecords.push({ register_number, student_name, email: raw_email });
    }
  }

  const totalStudents = studentRecords.length;
  console.log(`Prepared to import ${totalStudents} students...\n`);

  let successCount = 0;
  let existCount = 0;
  let failCount = 0;
  
  const reportData: ReportRow[] = [];

  // 3. Process each student
  for (let i = 0; i < studentRecords.length; i++) {
    const student = studentRecords[i];
    console.log(`Importing student ${i + 1} of ${totalStudents}... (${student.student_name})`);
    
    // Determine email
    let finalEmail = student.email.toLowerCase().replace(/\s+/g, '');
    if (!finalEmail) {
      finalEmail = generateEmail(student.student_name);
    }
    
    const initialPassword = student.register_number;
    let status = '';
    let errorMessage = '';

    if (existingEmails.has(finalEmail)) {
      console.log(`  ⚠ Already Exists: ${finalEmail}`);
      status = 'Already Exists';
      existCount++;
    } else {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: finalEmail,
          password: initialPassword,
          email_confirm: true,
          user_metadata: {
            full_name: student.student_name,
            register_number: student.register_number
          }
        });

        if (error) {
          // Double check if error is user already exists
          if (error.message.includes('already registered')) {
            console.log(`  ⚠ Already Exists: ${finalEmail}`);
            status = 'Already Exists';
            existCount++;
            existingEmails.add(finalEmail);
          } else {
            console.log(`  ✗ Failed: ${finalEmail} - ${error.message}`);
            status = 'Failed';
            errorMessage = error.message;
            failCount++;
          }
        } else {
          console.log(`  ✓ Created: ${finalEmail}`);
          status = 'Created';
          successCount++;
          existingEmails.add(finalEmail); // Add to set to prevent duplicates in same run
        }
      } catch (err: any) {
        console.log(`  ✗ Failed: ${finalEmail} - ${err.message}`);
        status = 'Failed';
        errorMessage = err.message;
        failCount++;
      }
    }
    
    reportData.push({
      register_number: student.register_number,
      student_name: student.student_name,
      email: finalEmail,
      status,
      error_message: errorMessage
    });
  }

  // 4. Generate Report
  const reportLines = ['Register Number,Student Name,Email,Status,Error Message'];
  for (const row of reportData) {
    reportLines.push(`"${row.register_number}","${row.student_name}","${row.email}","${row.status}","${row.error_message}"`);
  }
  
  fs.writeFileSync(reportFilePath, reportLines.join('\n'), 'utf-8');
  
  // 5. Final Summary
  console.log('\n=========================================');
  console.log('🏁 Import Complete');
  console.log('=========================================');
  console.log(`Total Students       : ${totalStudents}`);
  console.log(`Successfully Imported: ${successCount}`);
  console.log(`Already Existing     : ${existCount}`);
  console.log(`Failed Imports       : ${failCount}`);
  console.log('=========================================');
  console.log(`Report generated at: ${reportFilePath}`);
}

importStudents().catch(console.error);
