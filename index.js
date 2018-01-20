const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

var alertGroupId = process.env.TELEGRAM_ALERT_GROUP_ID
var newsGroupId = process.env.TELEGRAM_INFORMATION_GROUP_ID

// Create a bot that uses 'polling' to fetch new updates
const alertBot = new TelegramBot(process.env.TELEGRAM_INFORMATION_TOKEN, {polling: true});
const newsBot = new TelegramBot(process.env.TELEGRAM_ALERT_TOKEN, {polling: true});

alertBot.onText(/test/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  alertGroupId = msg.chat.id
  console.log("test", msg)
});


alertBot.on('message', (msg) => {
	console.log("MSG", msg.chat.id, alertGroupId, msg.message_id)
	console.log(msg)
	if (alertGroupId && msg.chat.id && msg.message_id && msg.chat.id != alertGroupId) {
  		alertBot.forwardMessage(alertGroupId, msg.chat.id, msg.message_id)
	}
});

newsBot.onText(/test/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  newsGroupId = msg.chat.id
  console.log("test", msg)
});


newsBot.on('message', (msg) => {
	console.log("MSG", msg.chat.id, newsGroupId, msg.message_id)
	console.log(msg)
	if (newsGroupId && msg.chat.id && msg.message_id && msg.chat.id != newsGroupId) {
  		newsBot.forwardMessage(newsGroupId, msg.chat.id, msg.message_id)
	}
});