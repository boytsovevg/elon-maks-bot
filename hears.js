const registerHears = bot => {
    bot.hears(['Hi', 'hi', 'Hello', 'hello'], ({reply, message}) => reply(`Hello, ${message.from.first_name || message.from.username}! 👋`));
    bot.hears('Elon', (ctx) => ctx.reply('Maks'));
}

module.exports = {
    registerHears
};