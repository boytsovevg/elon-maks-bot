const Telegraf = require('telegraf');
const SocksAgent = require('socks5-https-client/lib/Agent');

const config = require('./config');
const { startListening } = require('./bot/listen');
const { registerCommands } = require('./bot/commands');

const socksAgent = new SocksAgent({
    socksHost: config.proxy.host,
    socksPort: config.proxy.port,
    socksUsername: config.proxy.login,
    socksPassword: config.proxy.password,
});


const bot = new Telegraf(config.token, {
    telegram: { agent: socksAgent },
    channelMode: true
});

const store = {};

bot.start(ctx => ctx.reply('Hello there, use /help command to see available commands'));

bot.use((ctx, next) => {
    const chatId = ctx.chat.id;

    store[chatId] = store[chatId] || {};
    ctx.chatStore = store[chatId];

    next();
})

bot.use((ctx, next) => {
    const start = new Date();
    return next(ctx).then(() => {
        const ms = new Date() - start;
        console.log('Response time %sms', ms);
    })
})

startListening(bot);
registerCommands(bot);

bot.launch();
