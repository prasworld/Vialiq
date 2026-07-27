import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destDir = path.join(__dirname, 'icons-src');

const iconMap = {
  'add-circle': 'circle-plus',
  'alarm-clock': 'alarm',
  'bed-pulse': 'heart-rate-monitor',
  'blood-test-tube-alt': 'vaccine',
  'bookmark': 'bookmark',
  'bookmarked': 'bookmark',
  'building': 'building',
  'calculator-simple': 'calculator',
  'calendar': 'calendar',
  'capsules': 'pill',
  'check-circle': 'circle-check',
  'check': 'check',
  'chevron-down': 'chevron-down',
  'chevron-up': 'chevron-up',
  'circle-x': 'circle-x',
  'clock': 'clock',
  'comment': 'message',
  'diamond-exclamation': 'alert-triangle',
  'digital-signature': 'signature',
  'document': 'file',
  'edit-1': 'edit',
  'exclamation': 'exclamation-circle',
  'folder-download': 'folder-down',
  'home': 'home',
  'hospital': 'building-hospital',
  'info': 'info-circle',
  'lightbulb-question': 'bulb',
  'lock-open': 'lock-open',
  'lock': 'lock',
  'meeting': 'users',
  'memo-circle-check': 'clipboard-check',
  'minus-1': 'minus',
  'minus': 'minus',
  'paperclip-vertical': 'paperclip',
  'patient': 'user-plus',
  'pencil': 'pencil',
  'pending': 'clock-hour-4',
  'pharmacy': 'prescription',
  'plus-small': 'plus',
  'plus': 'plus',
  'query': 'database-search',
  'question-filled': 'help-hexagon',
  'question-mark': 'help',
  'save': 'device-floppy',
  'search': 'search',
  'stethoscope': 'stethoscope',
  'task-checklist': 'list-check',
  'test-tube': 'flask',
  'time-past': 'history',
  'trash-check': 'trash',
  'trash-xmark': 'trash-x',
  'trash': 'trash',
  'triangle-warning': 'alert-triangle',
  'upload': 'upload',
  'user-md': 'user-heart',
  'user-pen': 'user-edit',
  'user': 'user',
  'users': 'users',
  'x': 'x'
};

async function downloadIcon(targetName, tablerName) {
  const url = `https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/${tablerName}.svg`;
  const destPath = path.join(destDir, `${targetName}.svg`);

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          fs.writeFileSync(destPath, data);
          console.log(`✅ ${targetName}.svg (from ${tablerName})`);
          resolve();
        });
      } else if (res.statusCode === 404) {
        // Try filled variant if outline fails
        const filledUrl = `https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/filled/${tablerName}.svg`;
        https.get(filledUrl, (res2) => {
           if (res2.statusCode === 200) {
             let data = '';
             res2.on('data', chunk => data += chunk);
             res2.on('end', () => {
               fs.writeFileSync(destPath, data);
               console.log(`✅ ${targetName}.svg (from ${tablerName} FILLED)`);
               resolve();
             });
           } else {
             console.error(`❌ Failed to find ${tablerName} (outline or filled)`);
             resolve();
           }
        });
      } else {
        console.error(`❌ Error fetching ${tablerName}: ${res.statusCode}`);
        resolve();
      }
    }).on('error', (err) => {
      console.error(`❌ Network error on ${tablerName}: `, err);
      resolve();
    });
  });
}

async function run() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  console.log('Downloading mapped icons from Tabler...');
  const promises = Object.entries(iconMap).map(([target, tabler]) => downloadIcon(target, tabler));
  await Promise.all(promises);
  console.log('Done!');
}

run();
