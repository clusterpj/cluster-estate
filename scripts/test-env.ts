import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
console.log('Env file path:', envPath);
console.log('Env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('Env file contents:', fs.readFileSync(envPath, 'utf8'));
}

dotenv.config({ path: envPath });

console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
console.log('Process CWD:', process.cwd());
