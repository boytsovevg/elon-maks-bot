const hello = ['hi', 'hello', 'Hello', 'Hi'];
const elon = ['elon']

const messageType = {
    greet: 'greet',
    elon: 'elon'
}

const getAnswer = (message, from) => {
    let type = null;

    if (hello.includes(message.toLowerCase().replace(/\W+/g, ''))) {
        type = messageType.greet;
    }

    if (elon.includes(message.toLowerCase().replace(/\W+/g, ''))) {
        type = messageType.elon;
    }

    const answer = {
        [messageType.greet]: `🖖 Hi ${from.first_name || from.username}!`,
        [messageType.elon]: 'Maks'
    }[type];

    return answer;
}

module.exports = {
    getAnswer,
    hear: [...elon, ...hello]
};
