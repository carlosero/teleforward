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

var ownerId = parseInt(process.env.TELEGRAM_OWNER_ID) // Owner's id who can do the commands


// Create a bot that uses 'polling' to fetch new updates
const petesBot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

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
petesBot.onText(/\!enablealerts/, (msg, match) => {
  if (msg.from.id == ownerId) {
  	addRedisId('alerts', msg.chat.id)
  	petesBot.sendMessage(msg.chat.id, 'Done.')
  }
});
petesBot.onText(/\!enablenews/, (msg, match) => {
  if (msg.from.id == ownerId) {
  	addRedisId('news', msg.chat.id)
  	petesBot.sendMessage(msg.chat.id, 'Done.')
  }
});
petesBot.onText(/\!disablealerts/, (msg, match) => {
  if (msg.from.id == ownerId) {
  	removeRedisId('alerts', msg.chat.id)
  	petesBot.sendMessage(msg.chat.id, 'Done.')
  }
});
petesBot.onText(/\!disablenews/, (msg, match) => {
  if (msg.from.id == ownerId) {
  	removeRedisId('news', msg.chat.id)
  	petesBot.sendMessage(msg.chat.id, 'Done.')
  }
});

// Forwarders
petesBot.onText(/\!forwardalerts/, (msg, match) => {
  if (msg.from.id == ownerId) {
  	chat = msg.text.split(' ')[1]
  	petesBot.getChat(chat).then((res)=>{
	  	addRedisId('forwardalerts', res.id)
	  	petesBot.sendMessage(msg.chat.id, 'Done.')
  	}).catch((e) => { petesBot.sendMessage(msg.chat.id, 'Not found')})
  }
});
petesBot.onText(/\!forwardnews/, (msg, match) => {
  if (msg.from.id == ownerId) {
  	chat = msg.text.split(' ')[1]
  	petesBot.getChat(chat).then((res)=>{
	  	addRedisId('forwardnews', res.id)
	  	petesBot.sendMessage(msg.chat.id, 'Done.')
  	}).catch((e) => { petesBot.sendMessage(msg.chat.id, 'Not found')})
  }
});
petesBot.onText(/\!noforwardalerts/, (msg, match) => {
  if (msg.from.id == ownerId) {
  	chat = msg.text.split(' ')[1]
  	petesBot.getChat(chat).then((res)=>{
	  	removeRedisId('forwardalerts', res.id)
	  	petesBot.sendMessage(msg.chat.id, 'Done.')
  	}).catch((e) => { petesBot.sendMessage(msg.chat.id, 'Not found')})
  }
});
petesBot.onText(/\!noforwardnews/, (msg, match) => {
  if (msg.from.id == ownerId) {
  	chat = msg.text.split(' ')[1]
  	petesBot.getChat(chat).then((res)=>{
	  	removeRedisId('forwardnews', res.id)
	  	petesBot.sendMessage(msg.chat.id, 'Done.')
  	}).catch((e) => { petesBot.sendMessage(msg.chat.id, 'Not found')})
  }
});
// Others
petesBot.onText(/\!help/, (msg, match) => {
  if (msg.from.id == ownerId) {
  	message = "Commands:\n"
  	message += "!enablealerts: enable a channel to receive alerts\n"
	message += "!enablenews: enable a channel to receive news\n"
	message += "!disablealerts: channel wont receive alerts anymore\n"
	message += "!disablenews: channel wont receive news anymore\n"
	message += "!forwardalerts: forward messages from here to !enabled channels\n"
	message += "!forwardnews: forward messages from here to !enabled channels\n"
	message += "!noforwardalerts: stop forwarding messages from this group\n"
	message += "!noforwardnews: stop forwarding messages from this group\n"

  	petesBot.sendMessage(msg.chat.id, message)
  }
})

// Forward Handling
petesBot.on('message', (msg) => {
	if (msg.chat.id && msg.message_id) {
		if (groupIds['forwardalerts'].indexOf(msg.chat.id) != -1) {
			groupIds['alerts'].forEach((id) => {
  				petesBot.forwardMessage(id, msg.chat.id, msg.message_id)
			})
		}
	}
});

petesBot.on('message', (msg) => {
	if (msg.chat.id && msg.message_id) {
		if (groupIds['forwardnews'].indexOf(msg.chat.id) != -1) {
			groupIds['news'].forEach((id) => {
  				petesBot.forwardMessage(id, msg.chat.id, msg.message_id)
			})
		}
	}
});
