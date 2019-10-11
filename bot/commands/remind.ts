import { commandType } from '../constants/commandType';
import { BotContext, ChatStore, Reminder } from '../../bot';
import { Message } from 'telegram-typings';

const createId = require('nanoid');

const remind = (ctx: BotContext) => {

    const { chatStore, message, from, reply } = ctx;

    try {
        const members = getMembers(chatStore);

        if (!members.some(username => username === `@${from.username}`)) {
            throw Error(`Can not find you in team members - /${commandType.register}`);
        }

        const reminder = createReminder(message);
        setReminder(reminder, chatStore, reply);
        chatStore.reminders = chatStore.reminders || [];
        chatStore.reminders.push(reminder);

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

    const botTime = time.replace(/(:|\.)/, ':');

    const [nowTime] = new Date().toString().match(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/);

    if (nowTime > botTime) {
        throw Error(`Hmm...To be honest I can't remind you in the past /${ commandType.help }`);
    }

    return { id: createId(), name, time: botTime };
};

const setReminder = (reminder: Reminder, chatStore: ChatStore, reply: any) => {
    const dateTimeString = new Date().toString()
        .replace(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/, reminder.time);

    const intervalId = setInterval(() => {
        reminder.intervalId = intervalId;

        const timeNow = new Date();
        const reminderTime = new Date(dateTimeString);

        try {
            if (timeNow.getTime() >= reminderTime.getTime()) {
                clearInterval(reminder.intervalId);

                const members = getMembers(chatStore);
                chatStore.reminders = chatStore.reminders.filter(r => r.id !== reminder.id);

                return reply(`${ members } It is time to ${ reminder.name }`);
            }
        } catch (message) {
            throw Error(message);
        }

    }, 3000);
};

const getMembers = (chatStore: ChatStore): string[] => {

    if (chatStore.members) {

        return Array.from(chatStore.members.values()).map(m => `@${ m.username }`);
    }

    throw Error(`No members in team. Everyone should /${ commandType.register }`)
};

const getRemindersMessage = (store: ChatStore): string => {
    let remindersMessage = 'Team reminders: \n';

    const reminders = (store.reminders || [])
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

const getReminders = (store: ChatStore): Reminder[] => {
    return store.reminders || [];
};

const updateReminder = async (reminderName: string, ctx: BotContext): Promise<Message> => {

    try {
        deleteReminder(reminderName, ctx.chatStore);
    } catch (error) {
        return ctx.telegram.sendMessage(ctx.chat.id, error.message);
    }

    return await remind(ctx);
};

const deleteReminder = (reminderName: string, store: ChatStore): void => {
    const reminders = getReminders(store);

    const reminderToUpdate = reminders.find(r => r.name === reminderName);

    if (reminderToUpdate) {
        clearInterval(reminderToUpdate.intervalId);
    } else {
        throw Error(`Reminder with name ${reminderName} doesnt exist`);
    }
};

module.exports = {
    remind,
    getRemindersMessage,
    deleteReminder
};
