const logger = {
  info(message) {
    console.info(message);
  },

  log(message) {
    console.log(message);
  },

  error(message) {
    console.error(message);
  }
}

module.exports = {
  logger,
}