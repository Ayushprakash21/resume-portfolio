import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(walk(fullPath));
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.mjs')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./src');
const patterns = [
  'firebase/storage',
  'getStorage',
  'uploadBytes',
  'uploadBytesResumable',
  'getDownloadURL',
  'deleteObject',
  'ref('
];

const matches = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    for (const pat of patterns) {
      if (line.includes(pat)) {
        matches.push({
          file: path.relative('.', file),
          line: index + 1,
          pattern: pat,
          text: line.trim()
        });
        break;
      }
    }
  });
}

console.log(JSON.stringify(matches, null, 2));
