import { commandType } from '../constants/commandType';
import { BotContext, ChatStore, Reminder } from '../../bot';
import { Message } from 'telegram-typings';

const createId = require('nanoid');

const remind = (ctx: BotContext) => {

    const { chatStore, message, from, reply } = ctx;

    try {
        const reminder = createReminder(message);
        setReminder(reminder, chatStore, reply);
        chatStore.reminders = chatStore.reminders || [];
        chatStore.reminders.push(reminder);

        const members = getMembers(chatStore);

        return reply(`I will remind ${ members } to ${ reminder.name } at ${ reminder.time }`);

    } catch (error) {
        return reply(`@${ from.username } 🤔 \n ${ error.message }`);
    }
};

const createReminder = (message: Message): Reminder => {

    const [, name, time] = message.text.split(' ');

    if (!name || !time) {
        throw Error(`Hmm...I think it is better to specify message and time for your reminder \n Example: /${ commandType.remind } breakfast 11:00`)
    }

    const [nowTime] = new Date().toString().match(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/);

    if (nowTime > time) {
        throw Error(`Hmm...To be honest I can't remind you in the past /${ commandType.help }`);
    }

    return { id: createId(), name, time };
};

const setReminder = (reminder: Reminder, chatStore: ChatStore, reply: any) => {
    const dateTimeString = new Date().toString()
        .replace(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/, reminder.time);

    const intervalId = setInterval(() => {
        const timeNow = new Date();
        const reminderTime = new Date(dateTimeString);

        try {
            if (timeNow.getTime() >= reminderTime.getTime()) {
                clearInterval(intervalId);
                const members = getMembers(chatStore);
                chatStore.reminders = chatStore.reminders.filter(r => r.id !== reminder.id);

                return reply(`${ members } It is time to ${ reminder.name }`);
            }
        } catch (message) {
            throw Error(message);
        }

    }, 3000);
};

const getMembers = (chatStore: ChatStore) => {

    if (chatStore.members) {

        return Array.from(chatStore.members.values()).map(m => `@${ m.username }`);
    }

    throw Error(`No members in team. Everyone should /${ commandType.register }`)
};

const getReminders = (ctx: BotContext) => {
    const { chatStore } = ctx;

    let remindersMessage = 'Team reminders: \n';

    const reminders = (chatStore.reminders || [])
        .sort((prev, curr) => prev.time < curr.time ? -1 : 1);

    if (reminders.length) {
        for (const r of reminders) {
            remindersMessage += `${ r.name } - ${ r.time }\n`;
        }
    } else {
        remindersMessage += `No reminders. Add first /${ commandType.remind } {message} {time}`;
    }

    return remindersMessage;
};

module.exports = {
    remind,
    getReminders
};