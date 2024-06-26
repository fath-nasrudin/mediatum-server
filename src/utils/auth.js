const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { ApiError } = require('./error')

const attachUserIfTokenExist = () => {
  return async (req, res, next) => {
    // if user already attached, just skip the rest
    if (req.user) next();
    // verify valid bearer token format
    const isBearerToken = req.headers.authorization?.startsWith('Bearer ');
    if (!isBearerToken) {
      return next();
    }

    // verify token
    const [, token] = req.headers.authorization.split(' ');
    jwt.verify(token, config.jwt.secret, async (err, decoded) => {
      if (err) {
        return next();
      }

      // attach user to req object
      const userId = decoded.id;
      const user = await User.findById(userId);

      if (!user) {
        return next();
      }

      req.user = user;
      next();
    })
  }
}

const authenticate = () => {
  return async (req, res, next) => {
    // verify valid bearer token format
    const isBearerToken = req.headers.authorization?.startsWith('Bearer ');
    if (!isBearerToken) {
      return next(new ApiError(400, 'Invalid bearer token format'))
    }

    // verify token
    const [, token] = req.headers.authorization.split(' ');
    jwt.verify(token, config.jwt.secret, async (err, decoded) => {
      if (err) {
        return next(err);
      }

      // attach user to req object
      const userId = decoded.id;
      const user = await User.findById(userId);

      if (!user) {
        const err = new Error('User not found');
        err.status = 400;
        return next(err);
      }

      req.user = user;
      next();
    })

  }
}

const authenticateRefreshToken = () => {
  return async (req, res, next) => {
    // verify valid bearer token format
    const isBearerToken = req.headers.authorization?.startsWith('Bearer ');
    if (!isBearerToken) {
      return next(new ApiError(400, 'Invalid bearer token format'))
    }

    // verify token
    const [, token] = req.headers.authorization.split(' ');
    jwt.verify(token, config.jwt.secret, async (err, decoded) => {
      if (err) {
        return next(err);
      }

      // attach user to req object
      const userId = decoded.id;
      const user = await User.findById(userId);

      if (!user) {
        return next(new ApiError(401, 'Not Authorized - user not found'))
      }

      req.user = user;
      next();
    })

  }
}

const checkIsAdmin = () => (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return next(new ApiError(403, 'Forbidden'))
  }
  next();
}


const generateAccessToken = (id, options  = {}) => {
  const payload = {
    id,
  }
  const secretOrPrivateKey = config.jwt.secret;
  const jwtOptions = {
    expiresIn: config.jwt.access.exp,
  };
  return jwt.sign(payload, secretOrPrivateKey, jwtOptions)
}

const generateRefreshToken = (id, options  = {}) => {
  const payload = {
    id,
  }
  const secretOrPrivateKey = config.jwt.secret;
  const jwtOptions = {
    expiresIn: config.jwt.refresh.exp,
  };
  return jwt.sign(payload, secretOrPrivateKey, jwtOptions)
}

module.exports = {
  attachUserIfTokenExist,
  authenticateRefreshToken,
  authenticate,
  checkIsAdmin,
  generateAccessToken,
  generateRefreshToken,
}