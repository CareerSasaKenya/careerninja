import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function applyMigration() {
  try {
    const sql = readFileSync('./supabase/migrations/20260227_fix_candidate_documents_column_sizes.sql', 'utf8');
    
    console.log('Applying migration...');
    console.log(sql);
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applyMigration();
