const Discord = require('discord.js');
const cron = require('node-cron');
const { spawn } = require('child_process');

const {
  DBPATH, PYTHONPATH, SLURPERPATH, VLCSCRIPTPATH, TEXTCHANNEL,
} = require('./constants');
const sqlite = require('./sqlite');
const message = require('./message');
const log4js = require('./logger');

const logger = log4js.buildLogger();
const args = process.argv.slice(2);

const client = new Discord.Client();
client.login(args[0]);

// Function to run the Python scripts
function pythonScript(scriptPath) {
  const process = spawn(PYTHONPATH, [scriptPath], { cwd: './animeNightScript' });
  process.stdout.on('data', (data) => {
    logger.info(`Python: ${data.toString()}`);
  });
  process.stdout.on('error', (error) => {
    logger.error(`Python Critical: ${error.toString()}`);
  });
}

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
        pythonScript(SLURPERPATH);
      });
      cron.schedule('55 19 * * 6', () => {
        logger.info('Announce Broadcast.');
        targetChannels.forEach((channel) => {
          message.announceBroadcast(channel);
        });
      });
      cron.schedule('0 10 * * 6', () => {
        logger.info('Build Playlist');
        pythonScript(VLCSCRIPTPATH);
      });
      cron.schedule('0 10 * * 7', () => {
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
