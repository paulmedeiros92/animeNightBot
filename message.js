const moment = require('moment');
const Discord = require('discord.js');
const log4js = require('log4js');
const canned = require('./canned-messages');
const sqlite = require('./sqlite');
const anilist = require('./anilist-api');

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

const BOTID = '735214958618345513'; // Anime Night Bot ID
const ADMIN = '283785573351686144';

function buildEmbed(data) {
  let trailer = 'N/A';
  if (data.trailer && data.trailer.site === 'youtube') {
    trailer = `https://www.youtube.com/watch?v=${data.trailer.id}`;
  }
  return new Discord.MessageEmbed()
    .setColor(data.coverImage.color)
    .setTitle(data.title.english ? data.title.english : data.title.romaji)
    .setURL(data.siteUrl)
    .setDescription(data.description.replace(/<(.*?)>/g, ''))
    .setThumbnail(data.coverImage.medium)
    .setImage(data.bannerImage)
    .addFields(
      { name: 'Episodes', value: data.episodes },
      { name: 'Trailer', value: trailer },
    );
}

function specialAnnouncement(msg, channel) {
  const titles = msg.match(/"(.*?)"/g);
  titles.forEach((title) => {
    anilist.getAnimeInfo(title)
      .catch((error) => {
        logger.error(error);
      })
      .then((data) => {
        const ddd = data.data.data.Media;
        channel.send(buildEmbed(ddd));
      });
  });
}

function addShow(msg, mentions) {
  const raw = msg.match(/"(.*?)"/g);
  const words = raw[0].slice(1, -1).split(' ');
  const showTitle = words.map((word) => word[0].toUpperCase() + word.substring(1)).join(' ');
  const position = parseInt(msg.match(/(p\d+s)/g)[0].slice(1, -1), 10);
  const season = parseInt(msg.match(/(s\d+e)/g)[0].slice(1, -1), 10);
  const episode = parseInt(msg.match(/(s\d+e\d+)/g)[0].match(/(e\d+)/g)[0].slice(1), 10);
  const { users } = mentions;
  users.delete(BOTID);
  sqlite.addShow([
    Array.from(users.values())[0].id,
    showTitle,
    position ? position : 99,
    season ? season : 1,
    episode ? episode : 1,
  ]);
}

function changeShow(userId, msg) {
  const raw = msg.match(/"(.*?)"/g);
  const words = raw[0].slice(1, -1).split(' ');
  const showTitle = words.map((word) => word[0].toUpperCase() + word.substring(1)).join(' ');
  const season = parseInt(msg.match(/(s\d+e)/g)[0].slice(1, -1), 10);
  const episode = parseInt(msg.match(/(s\d+e\d+)/g)[0].match(/(e\d+)/g)[0].slice(1), 10);
  sqlite.updateShow([showTitle, season ? season : 1, episode ? episode : 1, userId]);
}

function lineupMsg(shows) {
  let date;
  if (moment().isoWeekday() >= 6) {
    date = moment().add(1, 'weeks').isoWeekday(6);
  } else {
    date = moment().isoWeekday(6);
  }
  const header = `\`\`\`LINEUP (${date.format('MMMM DD YYYY')} 8pm PDT):\n`;
  const content = shows.map((show) => `\t#${show.position} ${show.title} ~ Season ${show.season} Episode ${show.episode}`).join('\n');
  const footer = '\n```';
  return header + content + footer;
}

exports.evaluateMsg = ({
  channel, content, author, mentions,
}) => {
  const msg = content.toLowerCase();
  if (msg.includes('anime')) {
    sqlite.getLineup().then((rows) => {
      channel.send(lineupMsg(rows));
    });
  } else if (msg.includes('change')) {
    changeShow(author.id, msg);
  } else if (author.id === ADMIN && msg.includes('add')) {
    addShow(msg, mentions);
  } else if (author.id === ADMIN && msg.includes('special')) {
    if (msg.includes('update')) {
      changeShow('Special', msg);
    } else {
      specialAnnouncement(msg, channel);
    }
  } else {
    channel.send(canned.generalHow);
  }
};

exports.sendLineup = (channel) => {
  sqlite.getLineup().then((rows) => {
    channel.send(lineupMsg(rows));
  });
};

exports.announceBroadcast = (channel) => {
  channel.send('Anime Night will start in 5 minutes @everyone!!!');
};
