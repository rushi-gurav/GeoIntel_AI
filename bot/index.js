require('dotenv').config();
const { Telegraf } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const express = require('express');
const analyzeHandler = require('./handlers/analyze');
const compareHandler = require('../core/compare'); // Ensure correct path

const bot = new Telegraf(process.env.BOT_TOKEN);
const session = new LocalSession({ database: 'session_db.json' });
bot.use(session.middleware());

const ADMIN_PASSWORD = process.env.BOT_PASSWORD;
const authenticatedUsers = new Set();

// 🔐 /start command
bot.start((ctx) => {
  ctx.session = {};
  ctx.reply('🔒 Please enter admin password to continue:');
});

// 📩 Handle text: password, custom questions, and compare "done"
bot.on('text', async (ctx) => {
  const msg = ctx.message.text.trim();
  const userId = ctx.from.id;

  if (!authenticatedUsers.has(userId)) {
    if (msg === ADMIN_PASSWORD) {
      authenticatedUsers.add(userId);
      ctx.session = {};
      await ctx.reply('✅ Access granted. What would you like to do?', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📄 Summarize LAS', callback_data: 'summarize' }],
            [{ text: '🧾 Explain Fields', callback_data: 'explain_fields' }],
            [{ text: '🟢 Detect Payzones', callback_data: 'payzones' }],
            [{ text: '📊 Compare Logs (2–4)', callback_data: 'compare_logs' }],
            [{ text: '❓ Ask Custom Question', callback_data: 'custom_question' }],
          ],
        },
      });
    } else {
      ctx.reply('❌ Incorrect password. Try again.');
    }
    return;
  }

  // Custom question step 2
  if (ctx.session.intent === 'custom_question_step1') {
    ctx.session.intent = 'custom';
    ctx.session.question = msg;
    await ctx.reply('📥 Now send the .las file to analyze your question.');
  }

  // ✅ Done collecting logs for comparison
  else if (msg.toLowerCase() === 'done' && ctx.session.intent === 'compare_logs') {
    if (ctx.session.files && ctx.session.files.length >= 2) {
      // ✅ Added: AI analyzing message
      await ctx.reply('🤖 AI is analyzing the LAS files. Please wait...');

      // ✅ Added: Static Curve Info message
      await ctx.reply(
        '📊 ~Curve Information:\n' +
        'GR       : Gamma Ray\n' +
        'NPHI     : Neutron Porosity\n' +
        'RHOB     : Bulk Density\n' +
        'RT       : Resistivity\n' +
        'PHI      : Porosity'
      );

      // Continue with comparison
      await compareHandler(ctx, ctx.session.files);

      // Reset session
      ctx.session.intent = null;
      ctx.session.files = [];
    } else {
      ctx.reply('📌 Please send at least 2 LAS files before typing "done".');
    }
  } else {
    ctx.reply('📝 Please use the buttons to choose an action.');
  }
});

// 📍 Handle button presses
bot.on('callback_query', async (ctx) => {
  const intent = ctx.callbackQuery.data;
  const userId = ctx.from.id;

  if (!authenticatedUsers.has(userId)) {
    return ctx.answerCbQuery('❌ You are not authorized.');
  }

  if (intent === 'custom_question') {
    ctx.session.intent = 'custom_question_step1';
    ctx.session.question = '';
    await ctx.reply('💬 Please type your question first:');
  } else if (intent === 'compare_logs') {
    ctx.session.intent = 'compare_logs';
    ctx.session.files = [];
    await ctx.reply('📥 Send 2–4 LAS files one by one. Type "done" when finished.');
  } else {
    ctx.session.intent = intent;
    ctx.session.question = '';
    await ctx.reply('📥 Now send the .las file to continue.');
  }

  await ctx.answerCbQuery();
});

// 📎 Handle document uploads
bot.on('document', async (ctx) => {
  const intent = ctx.session.intent;
  const question = ctx.session.question || '';

  if (!intent) return ctx.reply('📝 Please choose an action first.');

  if (intent === 'compare_logs') {
    ctx.session.files = ctx.session.files || [];
    ctx.session.files.push(ctx.message.document);
    await ctx.reply(`📄 File "${ctx.message.document.file_name}" received. Send more or type "done".`);
    return;
  }

  // Regular analysis
  await analyzeHandler(ctx, intent, question);
  ctx.session.intent = null;
  ctx.session.question = null;
});

// 🚀 Launch bot
bot.launch();
console.log('🤖 Bot is running...');

// 🌐 Optional Express server
const app = express();
app.get('/', (req, res) => {
  res.send('📡 Well Log Analyzer Bot is running.');
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🌍 Server running on port ${PORT}`);
});
