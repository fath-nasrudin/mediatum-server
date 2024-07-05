const Article = require('../models/article.model');
const { ApiError } = require('../utils/error');
const { attachUserIfTokenExist } = require('../utils/auth');
const {
  validateString,
  checkValidationError,
  removeUnregisteredProperties,
  validateNotSanitizedString,
  validateBoolean,
  validateId,
  matchedData,
} = require('../utils/inputValidation');

module.exports.getArticleList = () => [
  attachUserIfTokenExist(),
  async (req, res, next) => {
    try {
      // move to utilities if this function needed in another place
      const sanitizeProperties = (obj, properties) => {
        return properties.reduce((result, property) => {
          if (obj.hasOwnProperty(property)) {
            result[property] = obj[property];
          }
          return result;
        }, {});
      };

      const { page = 1, limit = 0, sort, ...urlQueries } = req.query;
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const sortString = sort ? sort.split(/[,;]/).join(' ') : '-created_at';
      let filters = sanitizeProperties(urlQueries, ['is_published']);

      const isAdmin = req.user && req.user.is_admin;
      const selectString = !isAdmin ? 'title createdAt' : '-content';
      const currentPage = !limitNumber ? 1 : pageNumber;

      // if the requester not an admin, hide the unpublished articles
      if (!isAdmin) filters = { ...filters, is_published: true };

      const items = await Article.find(filters)
        .sort(sortString)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .select(selectString)
        .populate('user', 'first_name last_name username');
      const totalItems = await Article.countDocuments(filters);
      const totalPages = !limitNumber ? 1 : Math.ceil(totalItems / limitNumber);

      res.json({
        limitNumber,
        totalItems,
        totalPages,
        currentPage,
        items,
      });
    } catch (error) {
      next(error);
    }
  },
];

module.exports.getArticleById = () => [
  validateId('id', { location: 'param' }),
  checkValidationError(),
  async (req, res, next) => {
    try {
      const isAdmin = req.user && req.user.is_admin;
      const selectString = !isAdmin ? '-is_published' : null;
      let filters = { _id: req.params.id };
      if (!isAdmin) filters = { ...filters, is_published: true };

      const article = await Article.findOne(filters)
        .select(selectString)
        .populate('user', 'first_name last_name username');

      if (!article) throw new ApiError(404, 'Article not found');

      res.json(article);
    } catch (error) {
      next(error);
    }
  },
];

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
  validateId('id', { location: 'param' }),
  validateString('title').notEmpty().optional(),
  validateNotSanitizedString('content').notEmpty().optional(),
  validateBoolean('is_published').optional(),

  checkValidationError(),
  async (req, res, next) => {
    try {
      const articleData = matchedData(req, { locations: ['body'] });
      const updatedArticle = await Article.findByIdAndUpdate(
        req.params.id,
        articleData,
        { new: true }
      );

      if (!updatedArticle) throw new ApiError(404, 'Article not found');

      res.status(200).json(updatedArticle);
    } catch (error) {
      next(error);
    }
  },
];

module.exports.deleteArticleByIdParam = () => [
  validateId('id', { location: 'param' }),
  checkValidationError(),
  async (req, res, next) => {
    try {
      const deletedArticle = await Article.findByIdAndDelete(req.params.id);
      if (!deletedArticle)
        throw new ApiError(404, `Article with ${req.params.id} not found`);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
];
