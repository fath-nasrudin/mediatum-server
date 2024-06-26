const { logger } = require('../logger');

const normalizeError  = () => (err, req, res, next) => {
  if (err.additionalProperties) {
    for (const key in err.additionalProperties) {
      if (Object.hasOwnProperty.call(err.additionalProperties, key)) {
        err[key] = err.additionalProperties[key]
      }
    }
    delete err.additionalProperties;
  }
  next(err);
};

const sendError = () => (err, req, res, next) => {
  res.status(err.statusCode || err.status || 500).json({
    name: err.name,
    message: err.message, 
    ...err});
};

const logError = () => (err, req, res, next) => {
  logger.error(err);
  next(err);
};

const initialize = (app) => {
  app.use(normalizeError())
  app.use(logError())
  app.use(sendError())
}


module.exports = {
  ApiError: require('./ApiError'),
  sendError,
  logError,
  initialize,
}