// core/compare.js

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { spawn } = require('child_process');

async function downloadFile(fileUrl, fileName) {
  const localPath = path.resolve(__dirname, '../downloads', fileName);
  const writer = fs.createWriteStream(localPath);
  const response = await axios.get(fileUrl, { responseType: 'stream' });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(localPath));
    writer.on('error', reject);
  });
}

function runComparisonScript(filePaths) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '../python/compare_las.py');
    const python = spawn('python', [scriptPath, ...filePaths]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script error: ${stderr}`));
      }
      const outputPath = stdout.trim();
      if (fs.existsSync(outputPath)) {
        resolve(outputPath);
      } else {
        reject(new Error('Output file not found.'));
      }
    });
  });
}

async function compareHandler(ctx, telegramFiles) {
  const downloadedPaths = [];

  try {
    // Ensure downloads directory exists
    const downloadsDir = path.resolve(__dirname, '../downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    // Download each file from Telegram
    for (const file of telegramFiles) {
      const fileLink = await ctx.telegram.getFileLink(file.file_id);
      const localPath = await downloadFile(fileLink.href, file.file_name);
      downloadedPaths.push(localPath);
    }

    // Call Python script to compare and plot
    const plotPath = await runComparisonScript(downloadedPaths);
    await ctx.replyWithPhoto({ source: plotPath });

  } catch (err) {
    console.error('❌ Comparison error:', err);
    await ctx.reply('❌ Failed to compare LAS files. Please make sure they are valid.');
  } finally {
    // Clean up
    downloadedPaths.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
  }
}

module.exports = compareHandler;
