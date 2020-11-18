const log4js = require('log4js');

exports.buildLogger = () => {
  log4js.configure({
    appenders: {
      console: { type: 'console' },
      activity: { type: 'file', filename: 'activity.log', category: 'activity' },
    },
    categories: {
      default: { appenders: ['console', 'activity'], level: 'trace' },
    },
  });
  return log4js.getLogger('activity');
};
