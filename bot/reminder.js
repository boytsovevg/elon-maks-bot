const nanoid = require('nanoid');

const remindMe = ctx => {
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
                @${from.username} 🤔 \n Hmm...To be honest I can't remind you in the past /help
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
    }, 15000);

    return reply(`${from.first_name || from.username} I will remind you to "${reminder.name}" at ${reminder.time}`);
}

module.exports = {
    remindMe
};
