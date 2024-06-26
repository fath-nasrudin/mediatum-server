const Article = require('../models/article.model');
const { 
  validateString,
  checkValidationError,
  removeUnregisteredProperties,
  validateNotSanitizedString,
  validateBoolean,
} = require('../utils/inputValidation')

module.exports.createArticle = () => [
  validateString('title').notEmpty(),
  validateNotSanitizedString('content').notEmpty(),
  validateBoolean('is_published'),
  
  checkValidationError(),
  removeUnregisteredProperties(),
  async (req, res, next) => {
    res.json({
      message: 'Hit create article',
      body: req.body,
    });
  },
];