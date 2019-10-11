import { commandType } from '../constants/commandType';
import { BotContext, ChatStore, Reminder } from '../../bot';
import { Message } from 'telegram-typings';

const createId = require('nanoid');

export const remind = async (ctx: BotContext): Promise<Message> => {

    const { chatStore, message, from, reply } = ctx;

    try {
        const members = _getMembers(chatStore);

        if (!members.some(username => username === `@${ from.username }`)) {
            throw Error(`Can not find you in team members - /${ commandType.register }`);
        }

        const reminder = _createReminder(message);
        _setReminder(reminder, chatStore, reply);
        chatStore.reminders = chatStore.reminders || [];
        chatStore.reminders.push(reminder);

        return await reply(`I will remind ${ members } to ${ reminder.name } at ${ reminder.time }`);

    } catch (error) {
        return await reply(`@${ from.username } 🤔 \n ${ error.message }`);
    }
};

export const getRemindersMessage = (store: ChatStore): string => {
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

export const deleteReminder = (reminderName: string, store: ChatStore): void => {
    const reminders = getReminders(store);

    const reminder = reminders.find(r => r.name === reminderName);

    if (reminder) {
        clearInterval(reminder.intervalId);
        store.reminders = store.reminders.filter(r => r.id !== reminder.id);
    } else {
        throw Error(`Reminder with name ${ reminderName } does not exist`);
    }
};

export const getReminders = (store: ChatStore): Reminder[] => {
    return store.reminders || [];
};

const _createReminder = (message: Message): Reminder => {

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

const _setReminder = (reminder: Reminder, chatStore: ChatStore, reply: any) => {
    const dateTimeString = new Date().toString()
        .replace(/(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]/, reminder.time);

    const intervalId = setInterval(() => {
        reminder.intervalId = intervalId;

        const timeNow = new Date();
        const reminderTime = new Date(dateTimeString);

        try {
            if (timeNow.getTime() >= reminderTime.getTime()) {
                clearInterval(reminder.intervalId);

                const members = _getMembers(chatStore);
                chatStore.reminders = chatStore.reminders.filter(r => r.id !== reminder.id);

                return reply(`${ members } It is time to ${ reminder.name }`);
            }
        } catch (message) {
            throw Error(message);
        }

    }, 3000);
};

const _getMembers = (chatStore: ChatStore): string[] => {

    if (chatStore.members) {

        return Array.from(chatStore.members.values()).map(m => `@${ m.username }`);
    }

    throw Error(`No members in team. Everyone should /${ commandType.register }`)
};
