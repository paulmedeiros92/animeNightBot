const Discord = require('discord.js');
const log4js = require('log4js');
const cron = require('node-cron');
const { spawn } = require('child_process');
const sqlite = require('./sqlite');
const message = require('./message');

const PYTHONPATH = 'animeNightScript\\animeNight\\Scripts\\python.exe';
const SCRIPTPATH = 'animeNightScript\\animeSlurper.py';
const BROADCASTSCRIPT = 'animeNightScript\\vlcPlayer.py';
const TEXTCHANNEL = 'anime-night';

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

function pythonScript(scriptPath) {
  const process = spawn(PYTHONPATH, [scriptPath]);
  process.stdout.on('data', (data) => {
    logger.info(`Python: ${data.toString()}`);
  });
  process.stdout.on('error', (error) => {
    logger.info(`Python Critical: ${error.toString()}`);
  });
}

client.on('ready', () => {
  const targetChannels = Array.from(client.channels.cache.values())
    .filter((channel) => channel.type === 'text' && channel.name === TEXTCHANNEL);
  sqlite.openDB(dbPath).then(() => {
    cron.schedule('0 10 * * 6', () => {
      logger.info('Weekly Anime Announcement');
      targetChannels.forEach((channel) => {
        message.sendLineup(channel);
      });
      pythonScript(SCRIPTPATH);
    });
    cron.schedule('55 19 * * 6', () => {
      logger.info('Announce Broadcast');
      targetChannels.forEach((channel) => {
        message.announceBroadcast(channel);
      });
    });
    cron.schedule('15 11 * * 3', () => {
      logger.info('Begin Broadcast!');
      pythonScript(BROADCASTSCRIPT);
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
  });
});

client.on('message', (receivedMessage) => {
  if (receivedMessage.author !== client.user
    && receivedMessage.content.includes(client.user.id)) {
    logger.info(`This is ${receivedMessage.author.username}'s id: ${receivedMessage.author.id}, message: "${receivedMessage.content}"`);
    message.evaluateMsg(receivedMessage);
  }
});
