const nanoid = require('nanoid');
const { commandType } = require('./constants/commandType');

const remindMe = ctx => {
    const { session, message, from, reply } = ctx;
    session.reminders = session.reminders || [];

    const [, name, time] = message.text.split(' ');
    if (!name || !time) {
        return reply(`@${from.username} 🤔 \n Hmm...I think it is better to specify message and time for your reminder \n Example: /${commandType.remindMe} coffee 11:00`);
    }

    const [nowTime] = new Date().toString().match(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/);

    if (nowTime > time) {
        return reply(`
            @${from.username} 🤔 \n Hmm...To be honest I can't remind you in the past /help
        `);
    }

    let reminder = session.reminders.find(r => r.name === name);
    let dateTimeString = '00:00';

    if (reminder) {
        dateTimeString = reminder.time;

    } else {
        dateTimeString = new Date().toString().replace(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/, time);

        reminder = { id: nanoid(), name, time };

        session.reminders.push(reminder);
    }

    const intervalId = setInterval(() => {
        const timeNow = new Date();
        const reminderTime = new Date(dateTimeString);

        if (timeNow.getTime() >= reminderTime.getTime()) {

            clearInterval(intervalId);

            session.reminders = session.reminders.filter(r => r.id !== reminder.id);

            return reply(`@${from.username} Time to ${reminder.name}`);
        }
    }, 15000);

    return reply(`${from.first_name || from.username} I will remind you to "${reminder.name}" at ${reminder.time}`);
};

const remindTeam = ctx => {
    const { message, chatStore, reply, from } = ctx;

    if (!chatStore.members) {
        return reply(`No members in team. Everyone should /${commandType.register}`)
    }

    chatStore.reminders = chatStore.reminders || [];

    let reminder = chatStore.reminders.find(r => r.name === message.text);
    let dateTimeString = '00:00';

    if (reminder) {
        dateTimeString = reminder.time;

    } else {
        const [, name, time] = message.text.split(' ');

        if (!name || !time) {
            return reply(`@${from.username} 🤔 \n Hmm...I think it is better to specify message and time for your reminder \n Example: /${commandType.remindTeam} breakfast 11:00`);
        }

        const [nowTime] = new Date().toString().match(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/);

        if (nowTime > time) {
            return reply(`
                @${from.username} 🤔 \n Hmm...To be honest I can't remind you in the past /help
            `);
        }

        dateTimeString = new Date().toString().replace(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/, time);

        reminder = { id: nanoid(), name, time };

        chatStore.reminders.push(reminder);
    }

    const memberList = Array.from(chatStore.members.values())
        .map(m => `@${m.username}`);

    const intervalId = setInterval(() => {
        const timeNow = new Date();
        const reminderTime = new Date(dateTimeString);

        if (timeNow.getTime() >= reminderTime.getTime()) {

            clearInterval(intervalId);

            const reminderToExecute = chatStore.reminders.find(r => r.id === reminder.id);

            if (reminderToExecute) {
                chatStore.reminders = chatStore.reminders.filter(r => r.id !== reminder.id);

                const memberList = Array.from(chatStore.members.values())
                    .map(m => `@${m.username}`);

                return reply(`${memberList} It is time to ${reminder.name}`);
            }
        }
    }, 15000);

    return reply(`I will remind ${memberList} to "${reminder.name}" at ${reminder.time}`);
}

const getReminders = (ctx, type = 'personal') => {
    const { chatStore, session, from } = ctx;

    let remindersMessage = `${type === 'personal' && from.username || 'Team'} reminders: \n`;

    const remindersStore = type === 'personal' && session.reminders || chatStore.reminders;

    const reminders = (remindersStore || [])
        .sort((prev, curr) => prev.time < curr.time ? -1 : 1);

    if (reminders.length) {
        for (const r of reminders) {
            remindersMessage += `${r.name} - ${r.time}\n`;
        }
    } else {
        remindersMessage += `No reminders. Add first /${type === 'personal' && commandType.remindMe || commandType.remindTeam} {message} {time}`;
    }

    return remindersMessage;
}

module.exports = {
    remindMe,
    remindTeam,
    getReminders
};
