const { remind, getReminders } = require('../commands/remind');
const { commandType } = require('../constants/commandType');

const registerCommands = bot => {

    bot.command(commandType.showTeam, ctx => {
        const { chatStore, reply } = ctx;

        let message = 'Registered Members: \n';

        if (!chatStore.members) {
            message += `No members, be first! /${commandType.register}`;
        } else {
            for (const member of chatStore.members.values()) {
                message += `${ member.first_name } @${ member.username } \n`;
            }
        }

        reply(message);
    });

    bot.command(commandType.register, ctx => {

        const { reply, from, chatStore } = ctx;

        if (!chatStore.members) {
            chatStore.members = new Map();
        } else if (chatStore.members.has(from.id)) {
            return reply(`I see member @${ from.username } already registered`);
        }

        chatStore.members.set(from.id, from);

        return reply(`Member @${ from.username } registered`);
    });

    bot.command(commandType.remind, ctx => remind(ctx));

    bot.command(commandType.reminders, ctx => {

        const reminders = getReminders(ctx);

        ctx.reply(reminders);
    });

    bot.command(commandType.help, ({ reply }) => {
        let helpMessage = 'Available commands: \n';

        const commandInfo = {
            showTeam: `/${ commandType.showTeam } - shows registered chat members`,
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
};

module.exports = {
    registerCommands
};
