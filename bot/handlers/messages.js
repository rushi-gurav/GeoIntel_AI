// bot/handlers/messages.js
const { handleLasUpload } = require('../utils/fileHandler');

module.exports = (bot) => {
  bot.on('document', async (ctx) => {
    const fileName = ctx.message.document.file_name;
    if (!fileName.endsWith('.las')) {
      return ctx.reply('❌ Please upload a valid .las file.');
    }

    ctx.reply('📥 Received LAS file. Processing...');
    await handleLasUpload(ctx);
  });

  bot.on('text', (ctx) => {
    const text = ctx.message.text;

    if (text === '📄 Summarize Log File') {
      ctx.reply('📌 Please upload the LAS file you want to summarize.');
    } else if (text === '🔍 Explain Data Fields') {
      ctx.reply('📌 Please upload the LAS file and I will explain its fields.');
    } else if (text === '🧠 Identify Pay Zones') {
      ctx.reply('📌 Please upload the LAS file to analyze pay zones.');
    } else if (text === '📊 Summarize All Logs') {
      ctx.reply('📌 Upload the LAS file to receive a complete summary.');
    } else if (text === '📈 Plot Log Curves') {
      ctx.reply('📌 Feature coming soon. Stay tuned!');
    } else if (text === '💬 Custom Question') {
      ctx.reply('💬 Please send your question after uploading a LAS file.');
    } else {
      ctx.reply('ℹ️ Use /menu to choose an action or upload a .las file.');
    }
  });
};
