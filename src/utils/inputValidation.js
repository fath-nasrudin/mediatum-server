const { body, validationResult, matchedData } = require('express-validator');
const { ApiError } = require('../utils/error');

const validateBoolean = (name, options = {}) => {
  const message = `${name} should be a boolean`;

  return body(name, message)
    .optional()
    .trim()
    .escape()
    .isBoolean();
};

const validateNotSanitizedString = (name) => {
  const message = `${name} should be a string`;
  return body(name, message)
    .isString();
}

const validateString = (name, options = {}) => {
  const { min, max } = options;
  const message = `${name} should be a string`;
  const lengthMessage = `${name} should have ${min ? 'at least ' + min + ' chars' : ''} ${max ? 'max ' + max + ' chars': ''}`

  return body(name, message)
    .trim()
    .escape()
    .isLength({ min, max}).withMessage(lengthMessage)
    .isString();
};

const validateUsername = (name = 'username', options = {}) => {
  const { min = 3 } = options;
  const message = `${name} should at least have ${min} characters and only contain alphabet, number, and underscore characters`;
  return body(name, message)
    .trim()
    .escape()
    .isLength({ min }).bail()
    .isAlphanumeric().bail()
    .matches(/^[A-Za-z0-9_]+$/).bail()
}

const validatePassword = (name = 'password') => {
  return   body(name, `${name} should at least have 8 characters and at least have 1 uppercase, 1 lowercase, 1 number, and 1 symbol`)
    .trim()
    .escape()
    .isLength({ min: 8 }).bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);
}

const validateRepeatPassword = (repeatPasswordName, passwordName) => {
  return body(repeatPasswordName)
    .trim()
    .escape()
    .custom((value, { req }) => {
    if (value !== req.body[passwordName]) {
      throw new Error(`${passwordName} and ${repeatPasswordName} doesn't match`);
    }
    return true;
  })
}

const checkValidationError = () => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new ApiError(400, 'validation failed', { errors: errors.array()}))
    }
    next();
  }
}

const removeUnregisteredProperties = () => {
  return (req, res, next) => {
    req.body = matchedData(req);
    next();
  }
}

module.exports = {
  validateBoolean,
  validateString,
  validateNotSanitizedString,
  validateUsername,
  validatePassword,
  validateRepeatPassword,
  checkValidationError,
  removeUnregisteredProperties,
}


