const hello = ['hi', 'hello', 'Hello', 'Hi', 'Hello!', 'Hi!'];
const elon = ['elon', 'Elon'];

const messageType = {
    greet: 'greet',
    elon: 'elon'
};

const getAnswer = (message, from) => {
    let type = null;

    if (hello.includes(message)) {
        type = messageType.greet;
    }

    if (elon.includes(message)) {
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
