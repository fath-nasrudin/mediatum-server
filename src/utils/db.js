const mongoose = require('mongoose');
const { logger } = require('./logger');
const config = require('../config');

module.exports.connect = (stringConnection = config.db.stringConnection, options = {}) => {
  (async function() {
    await mongoose.connect(stringConnection)
  })()
    .then(() => logger.info('database connected'))
    .catch(err => logger.error(err));
}

// exports mongoose module as database
module.exports.database = mongoose;