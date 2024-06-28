const Article = require('../models/article.model');
const { ApiError } = require('../utils/error');
const { 
  validateString,
  checkValidationError,
  removeUnregisteredProperties,
  validateNotSanitizedString,
  validateBoolean,
  validateId,
  matchedData,
} = require('../utils/inputValidation')

module.exports.getArticleById = () => [
  validateId('id', {location: 'param'}),
  checkValidationError(),
  async (req, res, next) => {
    try {
      const isAdmin = req.user && req.user.is_admin 
      const selectString = !isAdmin ? '-is_published' : null ;
      let filters = { _id: req.params.id };
      if (!isAdmin) filters = {...filters, is_published: true}

      const article = await Article.findOne(filters)
        .select(selectString)
        .populate('user', 'first_name last_name username');
      

      if (!article) throw new ApiError(404, 'Article not found');

      res.json(article)
    } catch (error) {
      next(error)
    }
  }
]

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
      res.status(201).json(article);
    } catch (error) {
      next(error);
    }
  },
];

module.exports.updateArticle = () => [
  validateId('id', {location: 'param'}),
  validateString('title').notEmpty().optional(),
  validateNotSanitizedString('content').notEmpty().optional(),
  validateBoolean('is_published').optional(),
  
  checkValidationError(),
    async (req, res, next) => {
    try {
      const articleData = matchedData(req, {locations: ['body']});
      const updatedArticle = await Article.findByIdAndUpdate(req.params.id, articleData, {new: true});

      if (!updatedArticle) throw new ApiError(404, 'Article not found')
      
      res.status(200).json(updatedArticle);
    } catch (error) {
      next(error);
    }
  },
]

module.exports.deleteArticleByIdParam = () => [
  validateId('id', {location: 'param'}),
  checkValidationError(),
  async (req, res, next) => {
    try {
      const deletedArticle = await Article.findByIdAndDelete(req.params.id);
      if (!deletedArticle) throw new ApiError(404, `Article with ${req.params.id} not found`)
      res.sendStatus(204);
    } catch (error) {
      next(error)
    }
  }
]