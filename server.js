require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config');
const { logger } = require('./src/utils/logger');

app.listen(() => {
  logger.info(`server running on port ${config.port}`)
})