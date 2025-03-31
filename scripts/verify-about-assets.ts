import fs from 'fs';
import path from 'path';

const requiredImages = [
  'public/images/hero-about.jpg',
  'public/images/team/owners.jpg',
  'public/images/cabarete-villas-old.png',
  'public/images/cabarete-villas.png',
  'public/images/timeline/2000.jpg',
  'public/images/timeline/2005.jpg',
  'public/images/timeline/2010.jpg',
  'public/images/timeline/2015.jpg',
  'public/images/timeline/2020.jpg',
  'public/images/timeline/present.jpg'
];

function verifyFiles() {
  console.log('Verifying required files for About page...\n');
  const missingFiles: string[] = [];

  requiredImages.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(filePath);
    }
  });

  if (missingFiles.length === 0) {
    console.log('✅ All required files are present.');
    return;
  }

  console.log('❌ Missing required files:');
  missingFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log('\nPlease ensure all required files are present in the correct locations.');
}

verifyFiles();