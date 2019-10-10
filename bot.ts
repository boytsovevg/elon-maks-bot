import Telegraf, { ContextMessageUpdate } from 'telegraf';
import { User } from 'telegram-typings';

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


const bot: Telegraf<BotContext> = new Telegraf(config.token, {
    telegram: { agent: socksAgent }
});

interface Store {
    [key: number]: any
}

export interface Reminder {
    id: string;
    name: string;
    time: string;
}

export interface ChatStore {
    reminders: Reminder[];
    members: Map<number, User>;
}

export interface BotContext extends ContextMessageUpdate {
    chatStore: ChatStore
}

const store: Store = {};

bot.start((ctx: BotContext) => ctx.reply(`Hello there, use /${ commandType.help } command to see available commands`));

bot.use(session());
bot.use((ctx: BotContext, next: any) => {
    const chatId = ctx.chat.id;

    store[chatId] = store[chatId] || {};
    ctx.chatStore = store[chatId];

    next();
});

bot.use((ctx: BotContext, next: any) => {
    const start = new Date();
    return next(ctx).then(() => {
        const ms = new Date().getTime() - start.getTime();
        console.log('Response time %sms', ms);
    })
});

startListening(bot);
registerCommands(bot);

bot.telegram.getMe().then((info) => {
    bot.options.username = info.username;
    console.log(`Bot nickname: ${ info.username }`);
});

bot.catch((err: Error) => console.error(`BOT ERROR: ${ err }`));

bot.launch();
