const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config');

const attachUserIfTokenExist = () => {
  return async (req, res, next) => {
    // if user already attached, just skip the rest
    if (req.user) next();
    // verify valid bearer token format
    const isBearerToken = req.headers.authorization?.startsWith('Bearer ');
    if (!isBearerToken) {
      console.log('hit failed bearer');
      return next();
    }

    // verify token
    const [, token] = req.headers.authorization.split(' ');
    jwt.verify(token, config.jwt.secret, async (err, decoded) => {
      if (err) {
        console.log('hit jwt verification error');
        return next();
      }

      // attach user to req object
      const userId = decoded.id;
      const user = await User.findById(userId);

      if (!user) {
        console.log('hit jwt no user related to the id found');
        return next();
      }

      req.user = user;
      console.log('should be oke');
      next();
    })
  }
}

module.exports = {
  attachUserIfTokenExist,
}