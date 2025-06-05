const fs = require('fs');
const https = require('https');
const path = require('path');

function downloadFile(url, fileName) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../../downloads', fileName);

    // Ensure downloads folder exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(filePath));
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => reject(err));
    });
  });
}

module.exports = { downloadFile };
