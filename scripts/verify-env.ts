import dotenv from 'dotenv';
import path from 'path';

function verifyEnvironment() {
  // Load environment variables from .env.local
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });

  const requiredVars = [
    'ANTHROPIC_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('\nMissing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`- ${varName}`);
    });
    console.error('\nPlease add these variables to your .env.local file\n');
    process.exit(1);
  }

  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    console.error('\nInvalid NEXT_PUBLIC_SUPABASE_URL format:');
    console.error('- Must start with https://');
    process.exit(1);
  }

  console.log('✓ All required environment variables are set');
}

verifyEnvironment();
