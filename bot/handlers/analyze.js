// bot/handlers/analyze.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parseLasFile } = require('../../core/parser');
const { analyzeLogData } = require('../../core/analyzer');
const { downloadFile } = require('../utils/fileHandler');

module.exports = async (ctx, intent, question = '') => {
  try {
    // Check for document
    if (!ctx.message.document) {
      return ctx.reply('❗ Please send a .las file.');
    }

    const fileId = ctx.message.document.file_id;
    const file = await ctx.telegram.getFile(fileId);

    if (!file || !file.file_path) {
      return ctx.reply('❗ Unable to retrieve file from Telegram.');
    }

    const fileLink = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    const fileName = path.basename(file.file_path);

    // Check for valid file extension
    if (!fileName.endsWith('.las')) {
      return ctx.reply('⚠️ Only `.las` files are supported for analysis.');
    }

    // Download and parse the LAS file
    const localPath = await downloadFile(fileLink, fileName);
    const parsedData = await parseLasFile(localPath);

    if (!parsedData || typeof parsedData !== 'object') {
      return ctx.reply('❌ Could not parse the LAS file. Please ensure it is valid.');
    }

    // Analyze using OpenRouter
    const response = await analyzeLogData(parsedData, intent, question);

    // Reply to user with AI output
    await ctx.reply(`✅ Analysis complete:\n\n${response}`);

    // Clean up local file
    fs.unlinkSync(localPath);
  } catch (err) {
    console.error('❌ Analyze error:', err.stack || err.message);
    await ctx.reply('❌ Something went wrong while analyzing the log. Please try again later.');
  }
};
