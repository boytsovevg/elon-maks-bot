const nanoid = require('nanoid');

const commads = {
    showteam: 'showteam - shows registered chat members',
    registerme: 'registerme - registers you to team members',
    remindme: 'remindme - set a reminder. Example: /remindme breakfast 11:00',
    myreminders: 'myreminders - show list of incomplited reminders',
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

    bot.command('remindme', ctx => {
        const { session, message, from, reply } = ctx;

        session.reminders = session.remiders || [];

        let reminder = session.reminders.find(r => r.name === message.text);

        let dateTimeString = '00:00';
        if (reminder) {
            dateTimeString = reminder.time;
        } else {
            const [, name, time] = message.text.split(' ');

            if (!name || !time) {
                return reply(`@${from.username} 🤔 \n Hmm...I think it is better to specify message and time for your reminder /help`);
            }

            const nowTime = new Date().toString().match(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/)[0];

            if (nowTime > time) {
                return reply(`
                    @${from.username} 🤔 \n Hmm...To be honest I can't remind you in the past \n ...But you know about Terminator films 😇 /help
                `);
            }

            dateTimeString = new Date().toString().replace(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/, time);

            reminder = { id: nanoid(), name, time };

            session.reminders.push(reminder);
        }

        const intervalId = setInterval(() => {
            const timeNow = new Date();
            const reminderTime = new Date(dateTimeString);

            if (timeNow.getTime() >= reminderTime.getTime()) {

                clearInterval(intervalId);

                const reminderToExecute = session.reminders.find(r => r.id === reminder.id);

                if (reminderToExecute) {
                    session.reminders = session.reminders.filter(r => r.id !== reminder.id);

                    return reply(`@${from.username} Time to ${reminder.name}`);
                }
            }
        }, 5000);

        return reply(`${from.first_name || from.username} I will remind you to "${reminder.name}" at ${reminder.time}`);
    });

    bot.command('myreminders', ctx => {
        const { reply, session, from } = ctx;

        let remindersMessage = `${from.first_name || from.username} reminders: \n`;

        const reminders = (session.reminders || []).sort((prev, curr) => prev.time < curr.time ? -1 : 1);

        if (reminders.length) {
            for (const r of reminders) {
                remindersMessage += `${r.name} - ${r.time}\n`;
            }
        } else {
            remindersMessage += 'No reminders. Add first /remindme {message} {time}';
        }

        reply(remindersMessage);
    });

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