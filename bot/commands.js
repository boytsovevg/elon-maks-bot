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
            return reply(`I see member ${from.first_name || from.username} had been registered`);
        }

        chatStore.members.set(from.id, from);

        return reply(`Member ${from.first_name || from.username} was registered`);
    });
};

module.exports = {
    registerCommands
};