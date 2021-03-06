import Telegraf, { Extra, Markup } from 'telegraf';
import { BotContext } from '../../bot';

import { remind, getRemindersMessage, deleteReminder, getReminders } from './remind';

const { commandType } = require('../constants/commandType');

const registerCommands = (bot: Telegraf<BotContext>) => {

    bot.command(commandType.help, ({ reply }) => {
        let helpMessage = 'Available commands: \n';

        const commandInfo = {
            team: `/${ commandType.team } - shows registered chat members`,
            register: `/${ commandType.register } - registers you to team members`,
            remindTeam: `/${ commandType.remind } - set registered team reminder`,
            teamReminders: `/${ commandType.reminders } - show list of incomplete team reminders`
        };

        const commandsWithDescription = Object.values(commandInfo).map(c => `${ c }\n`);

        for (const c of commandsWithDescription) {
            helpMessage += c;
        }

        return reply(helpMessage);
    });

    bot.command(commandType.team, (ctx: BotContext) => {
        const { chatStore, reply } = ctx;

        let message = 'Registered Members: \n';

        if (!chatStore.members) {
            message += `No members, be first! /${ commandType.register }`;
        } else {
            for (const member of chatStore.members.values()) {
                message += `${ member.first_name } @${ member.username } \n`;
            }
        }

        reply(message);
    });

    bot.command(commandType.register, (ctx: BotContext) => {

        const { reply, from, chatStore } = ctx;

        if (!chatStore.members) {
            chatStore.members = new Map();
        } else if (chatStore.members.has(from.id)) {
            return reply(`I see member @${ from.username } already registered`);
        }

        chatStore.members.set(from.id, from);

        return reply(`Member @${ from.username } registered`);
    });

    bot.command(commandType.remind, (ctx: BotContext) => remind(ctx));

    bot.command(commandType.reminders, (ctx: BotContext) => ctx.reply(getRemindersMessage(ctx.chatStore)));

    bot.command(commandType.update, (ctx: BotContext) => {

        const keyboard = Markup.inlineKeyboard([
            Markup.callbackButton('Delete', 'delete')
        ]);

        const { from, session, message, reply, chatStore } = ctx;
        const [, name] = message.text.split(' ');

        if (!name) {
            return reply(`@${ from.username } specify reminder name \n (Example: /update coffee)`);
        }

        const reminders = getReminders(chatStore);

        if (!reminders.find(r => r.name === name)) {
            return reply(`@${ from.username } \n Reminder "${ name }" doesn't exist \n Create new? /${ commandType.remind }`);
        }

        session.lastEditedName = name;

        return ctx.telegram.sendCopy(ctx.chat.id, ctx.message, Extra.markup(keyboard));
    });

    bot.action('delete', async (ctx: BotContext) => {

        const { from, session, chatStore, deleteMessage } = ctx;

        try {
            await deleteMessage();
            deleteReminder(session.lastEditedName, chatStore);
        } catch (error) {
            return ctx.reply(`@${ from.username } \n ${ error.message }`)
        }

        return ctx.reply(`Reminder "${ ctx.session.lastEditedName }" deleted`);
    });
};

module.exports = {
    registerCommands
};
