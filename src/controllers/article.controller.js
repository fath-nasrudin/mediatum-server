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
    try {
      const article = new Article({
        ...req.body,
        user: req.user._id,
      });
      await article.save();
      res.status(201).json();
    } catch (error) {
      next(error);
    }
  },
];

module.exports.updateArticle = () => [
    async (req, res, next) => {
    try {
      res.status(200).json({message: 'hit update article'});
    } catch (error) {
      next(error);
    }
  },
]