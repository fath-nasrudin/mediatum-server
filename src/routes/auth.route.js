const router = require('express').Router();
const User = require('../models/user.model');
const { body, validationResult, matchedData } = require('express-validator');
const hasher = require('../utils/hasher');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { ApiError } = require('../utils/error');
const {
  checkIsAdmin,
  authenticate,
  authenticateRefreshToken,
  authenticateCookieRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/auth');

const validateBoolean = (name, options = {}) => {
  const message = `${name} should be a boolean`;

  return body(name, message).optional().trim().escape().isBoolean();
};

const validateString = (name, options = {}) => {
  const { min, max } = options;
  const message = `${name} should be a string`;
  const lengthMessage = `${name} should have ${
    min ? 'at least ' + min + ' chars' : ''
  } ${max ? 'max ' + max + ' chars' : ''}`;

  return body(name, message)
    .trim()
    .escape()
    .isLength({ min, max })
    .withMessage(lengthMessage)
    .isString();
};

const validateUsername = (name = 'username', options = {}) => {
  const { min = 3 } = options;
  const message = `${name} should at least have ${min} characters and only contain alphabet, number, and underscore characters`;
  return body(name, message)
    .trim()
    .escape()
    .isLength({ min })
    .bail()
    .isAlphanumeric()
    .bail()
    .matches(/^[A-Za-z0-9_]+$/)
    .bail();
};

const validateUniqueUsername = (name, options = {}) => {
  return body(name).custom(async (value) => {
    const user = await User.findOne({ [name]: value }).collation({
      locale: 'en',
      strength: 2,
    });
    if (user) {
      const err = new Error(`${name} already in use`);
      err.status = 400;
      throw err;
    }
  });
};

const validatePassword = (name = 'password') => {
  return body(
    name,
    `${name} should at least have 8 characters and at least have 1 uppercase, 1 lowercase, 1 number, and 1 symbol`
  )
    .trim()
    .escape()
    .isLength({ min: 8 })
    .bail()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    );
};

const validateRepeatPassword = (repeatPasswordName, passwordName) => {
  return body(repeatPasswordName)
    .trim()
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body[passwordName]) {
        throw new Error(
          `${passwordName} and ${repeatPasswordName} doesn't match`
        );
      }
      return true;
    });
};
const checkValidationError = () => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new ApiError(400, 'validation failed', { errors: errors.array() }));
    }
    next();
  };
};

const removeUnregisteredProperties = () => {
  return (req, res, next) => {
    req.body = matchedData(req);
    next();
  };
};

const validateSignup = () => {
  return [
    validateBoolean('is_admin'),
    validateString('first_name', {}).optional(),
    validateString('last_name', {}).optional(),
    validateUsername('username', { min: 3 }),
    validateUniqueUsername('username'),
    validatePassword('password'),
    validateRepeatPassword('password_repeat', 'password'),

    checkValidationError(),
    removeUnregisteredProperties(),
  ];
};

const hashPassword = (fieldName = 'password') => {
  return async (req, res, next) => {
    if (req.body[fieldName]) {
      req.body[fieldName] = await hasher.hash(req.body[fieldName]);
    }
    next();
  };
};

const validateLogin = () => {
  return [
    validateString('username'),
    validateString('password'),
    checkValidationError(),
    removeUnregisteredProperties(),
  ];
};

router.route('/signup').post([
  validateSignup(),
  hashPassword(),

  async (req, res) => {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json();
    } catch (error) {
      next(error);
    }
  },
]);

const attachUserByUsername = () => {
  return async (req, res, next) => {
    try {
      if (!req.body.username) return next();

      const user = await User.findOne({ username: req.body.username });
      if (!user) next();

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

router.route('/login').post([
  validateLogin(),
  attachUserByUsername(),
  async (req, res, next) => {
    try {
      if (!req.user) {
        next(new ApiError(400, 'Wrong username or Password'));
      }

      const isMatched = await hasher.compare(
        req.body.password,
        req.user.password
      );

      if (!isMatched) {
        next(new ApiError(400, 'Wrong username or Password'));
      }

      const refreshToken = generateRefreshToken({ _id: req.user._id });
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });

      res.json({
        access_token: generateAccessToken({
          _id: req.user._id,
          username: req.user.username,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
        }),
      });
    } catch (error) {
      next(error);
    }
  },
]);

router.route('/protected').get([
  authenticate(),
  (req, res) => {
    res.json({
      message: 'You access protected route',
      user: req.user,
    });
  },
]);

router.route('/admin-only').get([
  authenticate(),
  checkIsAdmin(),
  (req, res) => {
    res.json({
      message: 'You access admin only route',
      user: req.user,
    });
  },
]);

router.route('/refresh-token').get([
  authenticateCookieRefreshToken(),
  (req, res) => {
    res.json({
      access_token: generateAccessToken({
        _id: req.user._id,
        username: req.user.username,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
      }),
    });
  },
]);

router.route('/test-error').get([
  (req, res, next) => {
    next(new ApiError(404, 'User Not Found'));
  },
]);

module.exports = router;
