const { logger } = require('../logger');

const sendError = () => (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    name: err.name,
    message: err.message, 
    ...err});
};

const logError = () => (err, req, res, next) => {
  logger.error(err);
  next(err);
};

const initialize = (app) => {
  app.use(logError())
  app.use(sendError())
}


module.exports = {
  ApiError: require('./ApiError'),
  sendError,
  logError,
  initialize,
}