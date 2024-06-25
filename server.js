require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config');
const { logger } = require('./src/utils/logger');
const { connect: dbConnect } = require('./src/utils/db')

dbConnect();

app.listen(config.port, () => {
  logger.info(`server running on port ${config.port}`)
})