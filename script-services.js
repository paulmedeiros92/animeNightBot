const { spawn } = require('child_process');
const { PYTHONPATH } = require('./constants');
const log4js = require('./logger');

const logger = log4js.buildLogger();

// Function to run the Python scripts
exports.pythonScript = (scriptPath) => {
  const process = spawn(PYTHONPATH, [scriptPath], { cwd: './animeNightScript' });
  process.stdout.on('data', (data) => {
    logger.info(`Python: ${data.toString()}`);
  });
  process.stdout.on('error', (error) => {
    logger.error(`Python Critical: ${error.toString()}`);
    throw new Error(error);
  });
};
