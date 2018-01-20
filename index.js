const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
var redis = require("redis")

// Setup
var client = redis.createClient(process.env.REDIS_URL);
var groupIds = {
	'alerts': [],
	'news': [],
	'forwardalerts': [],
	'forwardnews': []
}


// Create a bot that uses 'polling' to fetch new updates
const newsBot = new TelegramBot(process.env.TELEGRAM_NEWS_TOKEN, {polling: true});
const alertBot = new TelegramBot(process.env.TELEGRAM_ALERT_TOKEN, {polling: true});

function addRedisId(group, id) {
	if (groupIds[group].indexOf(id) == -1) {
		groupIds[group].push(id)
		client.set(group, groupIds[group].join(','))
	}
}
function removeRedisId(group, id) {
	groupIds[group] = groupIds[group].filter((e) => e != id)
	client.set(group, groupIds[group].join(','))
}
function parseIfExists(x) { return x ? x.split(',').map((e) => parseInt(e)) : []}

client.get('alerts', (err,c) => { groupIds['alerts'] = parseIfExists(c) })
client.get('news', (err,c) => { groupIds['news'] = parseIfExists(c) })
client.get('forwardalerts', (err,c) => { groupIds['forwardalerts'] = parseIfExists(c) })
client.get('forwardnews', (err,c) => { groupIds['forwardnews'] = parseIfExists(c) })

// Receivers
alertBot.onText(/\!enablealerts/, (msg, match) => {
	console.log("HERE")
  addRedisId('alerts', msg.chat.id)
  alertBot.sendMessage(msg.chat.id, 'Done.')
});
newsBot.onText(/\!enablenews/, (msg, match) => {
  addRedisId('news', msg.chat.id)
  newsBot.sendMessage(msg.chat.id, 'Done.')
});
alertBot.onText(/\!disablealerts/, (msg, match) => {
  removeRedisId('alerts', msg.chat.id)
  alertBot.sendMessage(msg.chat.id, 'Done.')
});
newsBot.onText(/\!disablenews/, (msg, match) => {
  removeRedisId('news', msg.chat.id)
  newsBot.sendMessage(msg.chat.id, 'Done.')
});

// Forwarders
alertBot.onText(/\!forwardalerts/, (msg, match) => {
  addRedisId('forwardalerts', msg.chat.id)
  alertBot.sendMessage(msg.chat.id, 'Done.')
});
newsBot.onText(/\!forwardnews/, (msg, match) => {
  addRedisId('forwardnews', msg.chat.id)
  newsBot.sendMessage(msg.chat.id, 'Done.')
});
alertBot.onText(/\!noforwardalerts/, (msg, match) => {
  removeRedisId('forwardalerts', msg.chat.id)
  alertBot.sendMessage(msg.chat.id, 'Done.')
});
newsBot.onText(/\!noforwardnews/, (msg, match) => {
  removeRedisId('forwardnews', msg.chat.id)
  newsBot.sendMessage(msg.chat.id, 'Done.')
});


// Forward Handling
alertBot.on('message', (msg) => {
	if (msg.chat.id && msg.message_id) {
		if (groupIds['forwardalerts'].indexOf(msg.chat.id) != -1) {
			groupIds['alerts'].forEach((id) => {
  				alertBot.forwardMessage(id, msg.chat.id, msg.message_id)
			})
		}
	}
});

newsBot.on('message', (msg) => {
	if (msg.chat.id && msg.message_id) {
		if (groupIds['forwardnews'].indexOf(msg.chat.id) != -1) {
			groupIds['news'].forEach((id) => {
  				alertBot.forwardMessage(id, msg.chat.id, msg.message_id)
			})
		}
	}
});
