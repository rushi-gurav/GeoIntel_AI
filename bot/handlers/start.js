// bot/handlers/commands.js

module.exports = (bot) => {
  bot.start((ctx) => {
    ctx.session.isAuthenticated = false;
    ctx.reply('👋 Welcome to the Well Log Analyzer Bot.\nPlease enter the admin password to continue:');
  });

  bot.command('menu', (ctx) => {
    ctx.reply('📋 What would you like to do?', {
      reply_markup: {
        keyboard: [
          ['📄 Summarize Log File', '🔍 Explain Data Fields'],
          ['🧠 Identify Pay Zones', '📊 Summarize All Logs'],
          ['📈 Plot Log Curves', '💬 Custom Question']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  });
};
