"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const session = require('telegraf/session');
const SocksAgent = require('socks5-https-client/lib/Agent');
const config = require('./config');
const { startListening } = require('./bot/listen');
const { registerCommands } = require('./bot/commands/commands');
const { commandType } = require('./bot/constants/commandType');
const socksAgent = new SocksAgent({
    socksHost: config.proxy.host,
    socksPort: config.proxy.port,
    socksUsername: config.proxy.login,
    socksPassword: config.proxy.password,
});
const bot = new telegraf_1.default(config.token, {
    telegram: { agent: socksAgent }
});
const store = {};
bot.start((ctx) => ctx.reply(`Hello there, use /${commandType.help} command to see available commands`));
bot.use(session());
bot.use((ctx, next) => {
    const chatId = ctx.chat.id;
    store[chatId] = store[chatId] || {};
    ctx.chatStore = store[chatId];
    next();
});
bot.use((ctx, next) => {
    const start = new Date();
    return next(ctx).then(() => {
        const ms = new Date().getTime() - start.getTime();
        console.log('Response time %sms', ms);
    });
});
startListening(bot);
registerCommands(bot);
bot.telegram.getMe().then((info) => {
    bot.options.username = info.username;
    console.log(`Bot nickname: ${info.username}`);
});
bot.catch((err) => console.error(`BOT ERROR: ${err}`));
bot.launch();
//# sourceMappingURL=bot.js.map