const Telegraf = require('telegraf');
const SocksAgent = require('socks5-https-client/lib/Agent');

const config = require('./config');
const { registerHears } = require('./hears');
const { registerCommands } = require('./commands');


const socksAgent = new SocksAgent({
    socksHost: config.proxy.host,
    socksPort: config.proxy.port,
    socksUsername: config.proxy.login,
    socksPassword: config.proxy.password,
});

const bot = new Telegraf(config.token, {
    telegram: { agent: socksAgent }
});

const store = {};

bot.use((ctx, next) => {
    ctx.store = store;
    next();
})
bot.use((ctx, next) => {
    const start = new Date();
    return next(ctx).then(() => {
        const ms = new Date() - start;
        console.log('Response time %sms', ms);
    })
})

registerHears(bot);
registerCommands(bot);

bot.launch();