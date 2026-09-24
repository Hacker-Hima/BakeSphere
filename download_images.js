const fs = require('fs');
const https = require('https');
const path = require('path');

const filePath = 'd:/practice programm/MWT ALL/ReactMWT/BakeSphere/frontend/src/data/bakingoProducts.js';
const outputDir = 'd:/practice programm/MWT ALL/ReactMWT/BakeSphere/frontend/public/images/products';
const content = fs.readFileSync(filePath, 'utf8');

// Extract all unique unsplash URLs
const urlRegex = /https:\/\/images\.unsplash\.com\/photo-[^"']+/g;
const allUrls = [];
let match;
while ((match = urlRegex.exec(content)) !== null) {
  allUrls.push(match[0]);
}
const uniqueUrls = [...new Set(allUrls)];
console.log('Found ' + uniqueUrls.length + ' unique Unsplash URLs');

function getPhotoId(url) {
  const m = url.match(/photo-([a-zA-Z0-9_-]+)\?/);
  return m ? m[1] : null;
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      console.log('  SKIP (exists): ' + path.basename(filepath));
      resolve();
      return;
    }
    const smallUrl = url.replace(/w=\d+/, 'w=400').replace(/q=\d+/, 'q=70');
    
    const doDownload = (downloadUrl) => {
      https.get(downloadUrl, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
          doDownload(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          console.log('  FAIL: HTTP ' + res.statusCode + ' for ' + path.basename(filepath));
          resolve();
          return;
        }
        const file = fs.createWriteStream(filepath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          const size = fs.statSync(filepath).size;
          console.log('  OK: ' + path.basename(filepath) + ' (' + Math.round(size/1024) + ' KB)');
          resolve();
        });
      }).on('error', (err) => {
        console.log('  ERR: ' + err.message);
        resolve();
      });
    };
    doDownload(smallUrl);
  });
}

async function main() {
  const mapping = {};
  
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    const photoId = getPhotoId(url);
    if (!photoId) {
      console.log('Skip (no id): ' + url.substring(0, 80));
      continue;
    }
    
    const filename = photoId + '.jpg';
    const filepath = path.join(outputDir, filename);
    mapping[url] = '/images/products/' + filename;
    
    console.log('[' + (i + 1) + '/' + uniqueUrls.length + '] ' + photoId);
    try {
      await downloadImage(url, filepath);
    } catch (err) {
      console.log('  ERROR: ' + err.message);
    }
    await new Promise(r => setTimeout(r, 50));
  }
  
  // Save mapping
  const mappingPath = path.join(outputDir, 'url_mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log('\nDone! Downloaded ' + Object.keys(mapping).length + ' images.');
  console.log('Mapping saved to: ' + mappingPath);
}

main().catch(console.error);
