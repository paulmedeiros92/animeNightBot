const sqlite3 = require('sqlite3').verbose();
const log4js = require('./logger');

const logger = log4js.buildLogger();
let db = {};

function createLineupTable() {
  logger.info('createLineupTable: start');
  const query = `CREATE TABLE IF NOT EXISTS lineup (userId INTEGER NOT NULL, title TEXT NOT NULL, position INTEGER NOT NULL, 
    season INTEGER NOT NULL, episode INTEGER NOT NULL CHECK (position > 0 AND season > 0 AND episode > 0))`;
  return new Promise((resolve, reject) => {
    db.exec(query, (err) => {
      if (err) {
        logger.error(`createLineupTable: ${err.message}`);
        reject(err);
      } else {
        logger.info('createLineupTable: success');
        resolve(true);
      }
    });
  });
}

exports.openDB = (path) => {
  logger.info('openDB: attempting to open DB');
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(path, (err) => {
      if (err) {
        logger.error(`openDB: ${err.message}`);
        reject(err.message);
      } else {
        logger.info('openDb: connected to the in-memory SQlite database.');
        createLineupTable().then(() => {
          resolve(true);
        });
      }
    });
  });
};

exports.updateShow = (params) => {
  const updateQuery = 'UPDATE lineup SET title = ?, season = ?, episode = ? WHERE userId = ?';
  return new Promise((resolve, reject) => {
    db.run(updateQuery, params, (err) => {
      if (err) {
        logger.error(`updateShow: ${err.message}`);
        reject(err);
      } else {
        logger.info('updateShow: success');
        resolve();
      }
    });
  });
};

exports.addShow = (params) => {
  const updateQuery = 'INSERT OR REPLACE INTO lineup (userId, title, position, season, episode) VALUES (?,?,?,?,?)';
  return new Promise((resolve, reject) => {
    db.run(updateQuery, params, (err) => {
      if (err) {
        logger.error(`addShow: ${err.message}`);
        reject(err);
      } else {
        logger.info('addShow: success');
        resolve();
      }
    });
  });
};

exports.getLineup = () => {
  logger.info('getLineup: start');
  const getQuery = 'SELECT * FROM lineup ORDER BY position ASC';
  return new Promise((resolve, reject) => {
    db.all(getQuery, [], (err, rows) => {
      if (err) {
        logger.error(`getLineup: ${err.message}`);
        reject(err);
      } else {
        logger.info('getLineup: success');
        resolve(rows);
      }
    });
  });
};

exports.incEpisodes = (inc) => {
  const updateQuery = 'UPDATE lineup SET episode = episode + ?';
  return new Promise((resolve, reject) => {
    db.run(updateQuery, [inc], (err) => {
      if (err) {
        logger.error(`incEpisodes: ${err.message}`);
        reject(err);
      } else {
        logger.info('incEpisodes: success');
        resolve();
      }
    });
  });
};
