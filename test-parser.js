// test-parser.js (for testing only)
const { parseLasFile } = require('./core/parser');
const path = require('path');

(async () => {
  const filePath = path.join(__dirname, 'sample_data', 'test.las');
  try {
    const result = await parseLasFile(filePath);
    console.log('Parsed LAS Data:', result);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
