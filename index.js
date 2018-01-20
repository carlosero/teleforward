const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;
var groupId // this will be set for group id

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Listen for any kind of message. There are different kinds of
// messages.

bot.onText(/test/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  groupId = msg.chat.id
  console.log("test", msg)
});


bot.on('message', (msg) => {
	console.log("MSG", msg.chat.id, groupId, msg.message_id)
	console.log(msg)
	if (groupId && msg.chat.id && msg.message_id && msg.chat.id != groupId) {
  		bot.forwardMessage(groupId, msg.chat.id, msg.message_id)
	}
});