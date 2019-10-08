const registerCommands = bot => {

    bot.command('showteam', ctx => {
        const { store, reply } = ctx;

        let message = 'Registered Members: \n';

        if (!store.members) {
            message += 'No members, be first!';
        } else {
            for (const member of store.members.values()) {
                message += `${member.first_name} @${member.username} \n`;
            }
        }

        reply(message);
    });

    bot.command('registerme', ctx => {

        const { reply, from, store } = ctx;

        if (!store.members) {
            store.members = new Map();
        } else if (store.members.has(from.id)) {
            return reply(`I see member ${from.first_name || from.username} had been registered`);
        }

        store.members.set(from.id, from);

        return reply(`Member ${from.first_name || from.username} was registered`);
    });
};

module.exports = {
    registerCommands
};