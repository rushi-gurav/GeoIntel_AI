// core/parser.js
const { exec } = require('child_process');
const path = require('path');

/**
 * Parses a LAS file by calling the Python script.
 * @param {string} filePath - Absolute path to the .las file.
 * @returns {Promise<object>} - Parsed LAS data as a JSON object.
 */
function parseLasFile(filePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../python/parse_las.py');
    const command = `python "${scriptPath}" "${filePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Python error: ${stderr}`);
        return reject(new Error('Python script failed.'));
      }

      try {
        const json = JSON.parse(stdout);
        if (json.error) {
          return reject(new Error(`Parser error: ${json.error}`));
        }
        resolve(json);
      } catch (e) {
        reject(new Error('Failed to parse JSON output from Python.'));
      }
    });
  });
}

module.exports = { parseLasFile };
