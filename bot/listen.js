const { getAnswer, hear } = require('./wordsToAnswers');

const startListening = bot => {
    bot.on('text', ctx => {
        const answer = getAnswer(ctx.message.text, ctx.message.from);

        if (answer) {
            return ctx.reply(answer);
        }
    });
}

module.exports = {
    startListening
};
