const fs = require('fs');

const filePath = 'd:/practice programm/MWT ALL/ReactMWT/BakeSphere/frontend/src/data/bakingoProducts.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all unsplash URLs with local paths based on photo ID
const urlRegex = /https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)\?[^"'`]+/g;

let count = 0;
content = content.replace(urlRegex, (fullMatch, photoId) => {
  count++;
  return '/images/products/' + photoId + '.jpg';
});

fs.writeFileSync(filePath, content);
console.log('Replaced ' + count + ' Unsplash URLs with local paths');

// Also do the backend products.js
const backendPath = 'd:/practice programm/MWT ALL/ReactMWT/BakeSphere/backend/src/data/products.js';
if (fs.existsSync(backendPath)) {
  let backendContent = fs.readFileSync(backendPath, 'utf8');
  let bcount = 0;
  backendContent = backendContent.replace(urlRegex, (fullMatch, photoId) => {
    bcount++;
    return '/images/products/' + photoId + '.jpg';
  });
  fs.writeFileSync(backendPath, backendContent);
  console.log('Replaced ' + bcount + ' Unsplash URLs in backend products.js');
}

console.log('Done!');
