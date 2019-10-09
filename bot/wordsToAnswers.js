const hello = ['hi', 'hello'];
const elon = ['elon']

const messageType = {
    greet: 'greet',
    elon: 'elon'
}

const getAnswer = (message, from) => {
    let type = null;

    if (hello.includes(message)) {
        type = messageType.greet;
    }

    if (elon.includes(message)) {
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
    listeningWords: [...elon, ...hello]
};
