import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destDir = path.join(__dirname, 'icons-src');
const sourceDir = '/tmp/healthicons/healthicons-main/public/icons/svg/outline';

const categories = [
  'body',
  'conditions',
  'diagnostics',
  'specialties',
  'blood' // Adding blood because organs might be under it, and therapeutic areas
];

function run() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Source directory not found: ${sourceDir}`);
    console.error('Please ensure the Healthicons repository is downloaded and extracted to /tmp/healthicons');
    process.exit(1);
  }

  let copiedCount = 0;

  for (const category of categories) {
    const categoryPath = path.join(sourceDir, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.warn(`⚠️ Category not found in source: ${category}`);
      continue;
    }

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.svg'));
    
    for (const file of files) {
      const srcFile = path.join(categoryPath, file);
      
      // We want to prefix all Healthicons with hi- so the generator knows they are filled outlines
      // We also replace underscores with hyphens for consistency
      const cleanName = file.replace(/_/g, '-').replace('.svg', '');
      const destFile = path.join(destDir, `hi-${cleanName}.svg`);

      fs.copyFileSync(srcFile, destFile);
      copiedCount++;
    }
    console.log(`✅ Copied ${files.length} icons from category: ${category}`);
  }

  console.log(`\nDone! Copied a total of ${copiedCount} Healthicons to ${destDir}`);
}

run();
