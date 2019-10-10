import { User } from 'telegraf/typings/telegram-types';

const hello = ['hi', 'hello', 'Hello', 'Hi', 'Hello!', 'Hi!'];
const elon = ['elon', 'Elon'];

const messageType = {
    greet: 'greet',
    elon: 'elon'
};

const getAnswer = (textMessage: string, from: User): string => {
    let type = null;

    if (hello.includes(textMessage)) {
        type = messageType.greet;
    }

    if (elon.includes(textMessage)) {
        type = messageType.elon;
    }

    return {
        [messageType.greet]: `🖖 Hi ${ from.first_name || from.username }!`,
        [messageType.elon]: 'Maks'
    }[type];
};

module.exports = {
    getAnswer,
    listeningWords: [...elon, ...hello]
};
