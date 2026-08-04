const fs = require('fs');
const path = require('path');

function getFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(getFiles(file, exts));
      }
    } else {
      if (exts.some(ext => file.endsWith(ext))) {
        results.push(file);
      }
    }
  });
  return results;
}

const sourceFiles = getFiles('.', ['.ts', '.tsx', '.js', '.jsx', '.md']);
const publicFiles = getFiles('public', ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.JPG']).map(f => f.replace(/^public[\\\/]/, '').replace(/\\/g, '/'));

const publicFileSet = new Set(publicFiles);
console.log('Public files found:', publicFiles.length);

let missingFiles = [];

sourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/["'`](\/[a-zA-Z0-9_\-\/.]+?\.(?:png|jpg|jpeg|svg|gif|webp|JPG))["'`]/g);
  if (matches) {
    matches.forEach(match => {
      const src = match.slice(1, -1);
      const cleanedSrc = src.replace(/^\//, '');
      if (!publicFileSet.has(cleanedSrc) && !src.startsWith('http')) {
        missingFiles.push({ file, src });
      }
    });
  }
});

console.log('Missing files:');
missingFiles.forEach(m => console.log(m.file + ': ' + m.src));
