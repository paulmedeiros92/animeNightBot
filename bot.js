const Discord = require('discord.js');
const cron = require('node-cron');

const {
  DBPATH, SLURPERPATH, VLCSCRIPTPATH, TEXTCHANNEL,
} = require('./constants');
const sqlite = require('./sqlite');
const message = require('./message');
const log4js = require('./logger');
const scriptServices = require('./script-services');

const logger = log4js.buildLogger();
const args = process.argv.slice(2);

const client = new Discord.Client();
client.login(args[0]);

// READY EVENT
client.on('ready', () => {
  const targetChannels = Array.from(client.channels.cache.values())
    .filter((channel) => channel.type === 'text' && channel.name === TEXTCHANNEL);
  sqlite.openDB(DBPATH)
    .then(() => {
      cron.schedule('0 10 * * 5', () => {
        logger.info('Begin Download and Announce.');
        targetChannels.forEach((channel) => {
          message.sendLineup(channel);
        });
        scriptServices.pythonScript(SLURPERPATH);
      });
      cron.schedule('55 19 * * 5', () => {
        logger.info('Announce Broadcast.');
        targetChannels.forEach((channel) => {
          message.announceBroadcast(channel);
        });
      });
      cron.schedule('0 18 * * 5', () => {
        logger.info('Build Playlist');
        scriptServices.pythonScript(VLCSCRIPTPATH);
      });
      cron.schedule('0 10 * * 6', () => {
        logger.info('New LineUp Message');
        const promises = [
          sqlite.incEpisodes('1'),
          sqlite.updateShow(['Mystery Show', 1, 1, 'Special']),
        ];
        Promise.all(promises)
          .then(() => {
            targetChannels.forEach((channel) => {
              message.sendLineup(channel);
            });
          });
      });
      logger.info('Ready');
    })
    .catch((error) => logger.error(error));
});

// MESSAGE EVENT
client.on('message', (receivedMessage) => {
  if (receivedMessage.author !== client.user
    && receivedMessage.content.includes(client.user.id)) {
    logger.info(`This is ${receivedMessage.author.username}'s id: ${receivedMessage.author.id}, message: "${receivedMessage.content}"`);
    message.evaluateMsg(receivedMessage);
  }
});
