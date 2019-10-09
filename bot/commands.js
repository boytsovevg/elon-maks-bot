const commads = {
    showteam: 'showteam - shows registered chat members',
    registerme: 'registerme - registers you to team members',
    help: 'help - shows a list of available commands'
};

const registerCommands = bot => {

    bot.command('showteam', ctx => {
        const { chatStore, reply } = ctx;

        let message = 'Registered Members: \n';

        if (!chatStore.members) {
            message += 'No members, be first!';
        } else {
            for (const member of chatStore.members.values()) {
                message += `${member.first_name} @${member.username} \n`;
            }
        }

        reply(message);
    });

    bot.command('registerme', ctx => {

        const { reply, from, chatStore } = ctx;

        if (!chatStore.members) {
            chatStore.members = new Map();
        } else if (chatStore.members.has(from.id)) {
            return reply(`I see member ${from.first_name || from.username} already registered`);
        }

        chatStore.members.set(from.id, from);

        return reply(`Member ${from.first_name || from.username} registered`);
    });

    bot.command('remindme', ctx => {});

    bot.command('remindTeam', ctx => {});

    bot.command('remindAt', ctx => {});

    bot.command('help', ({reply}) => {
        let helpMessage = 'Available commands: \n';

        const commandsList = Object.values(commads).map(c => `/${c}\n`);

        for (const c of commandsList) {
            helpMessage += c;
        }

        return reply(helpMessage);
    });
};

module.exports = {
    registerCommands
};