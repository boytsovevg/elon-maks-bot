const { getAnswer, listeningWords } = require('./wordsToAnswers');

const startListening = bot => {
    bot.hears(listeningWords, ctx => {
        const answer = getAnswer(ctx.message.text, ctx.message.from);

        if (answer) {
            return ctx.reply(answer);
        }
    });

    bot.hears(['commands', 'help', 'command', '/'], ctx => {

        return ctx.reply('👉🏻 /help');
    });
}

module.exports = {
    startListening
};
