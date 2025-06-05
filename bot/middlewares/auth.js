// bot/middlewares/auth.js

module.exports = (ctx, next) => {
  if (!ctx.session) ctx.session = {};

  // Let user pass password first
  if (!ctx.session.isAuthenticated) {
    if (ctx.message?.text === process.env.ADMIN_PASSWORD) {
      ctx.session.isAuthenticated = true;
      ctx.reply('🔓 Access granted. Use /menu to begin.');
    } else {
      ctx.reply('🔐 Please enter the admin password to continue:');
    }
    return;
  }

  // If authenticated, continue to next handler
  return next();
};
