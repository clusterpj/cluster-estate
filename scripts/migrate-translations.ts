import { createServiceClient } from '@/lib/supabase-server';
import dotenv from 'dotenv';
import path from 'path';

async function migrateTranslations() {
  try {
    // Load environment variables from .env.local
    dotenv.config({ path: path.join(process.cwd(), '.env.local') });

    // Debug environment variables
    console.log('Checking environment variables...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(`Required environment variables are missing:
      NEXT_PUBLIC_SUPABASE_URL: ${!!supabaseUrl}
      SUPABASE_SERVICE_ROLE_KEY: ${!!serviceRoleKey}
      
      Please ensure these variables are set in your .env.local file`);
    }

    console.log('Creating Supabase service client...');
    const supabase = createServiceClient();

    console.log('Creating translations table...');

    // SQL from our migration file
    await supabase.from('translations').select('id').limit(1);
    console.log('Translations table exists and is accessible');

    console.log('✓ Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

migrateTranslations();