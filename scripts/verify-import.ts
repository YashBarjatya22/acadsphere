import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkDatabase() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (userError) throw userError;
  const userCount = users.users.length;
  
  const { count: profileCount, error: profileError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  if (profileError) throw profileError;
  
  const { count: metricsCount, error: metricsError } = await supabase
    .from('student_metrics')
    .select('*', { count: 'exact', head: true });
  if (metricsError) throw metricsError;

  console.log('--- VERIFICATION RESULT ---');
  console.log(`auth.users count: ${userCount}`);
  console.log(`profiles count: ${profileCount}`);
  console.log(`student_metrics count: ${metricsCount}`);
}

checkDatabase().catch(console.error);
