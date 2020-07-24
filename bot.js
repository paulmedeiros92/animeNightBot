const Discord = require('discord.js');
const log4js = require('log4js');
const cron = require('node-cron');
const sqlite = require('./sqlite');
const message = require('./message');
const canned = require('./canned-messages');

log4js.configure({
  appenders: {
    console: { type: 'console' },
    activity: { type: 'file', filename: 'activity.log', category: 'activity' },
  },
  categories: {
    default: { appenders: ['console', 'activity'], level: 'trace' },
  },
});

const logger = log4js.getLogger('activity');
const args = process.argv.slice(2);

const client = new Discord.Client();
client.login(args[0]);
const dbPath = '../AnimeNightDB/AnimeNightDB.db';

client.on('ready', () => {
  sqlite.openDB(dbPath).then(() => {
    cron.schedule('* 10 * * 6', () => {
      logger.info(`Weekly Anime Announcement: ${canned.anime}`);
      client.channels.forEach((channel) => {
        if (channel.type === 'text') {
          message.sendLineup(channel);
        }
      });
    });
    logger.info('Ready');
  });
});

client.on('message', (receivedMessage) => {
  if (receivedMessage.author !== client.user
    && receivedMessage.content.includes(client.user.id)) {
    logger.info(`This is ${receivedMessage.author.username}'s id: ${receivedMessage.author.id}, message: "${receivedMessage.content}"`);
    message.evaluateMsg(receivedMessage);
  }
});
