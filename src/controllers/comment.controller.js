const Comment = require('../models/comment.model');
const { checkValidationError, matchedData, validateString,} = require('../utils/inputValidation');

module.exports.getCommentListByArticleIdParam = () => [
  // pagination handler
  (req, res, next) => {
    const {
          page = 1,
          limit = 5,
          sort,
          ...Queries
        } = req.query;
      req.pagination = {
        page: parseInt(page),
        limit:  parseInt(limit),
        sort,
        Queries,
      }
    next();
  },
  async (req, res, next) => {
    try {
      let filters = { article: req.params.articleId };
      const totalItems = await Comment.countDocuments(filters);
      const comments = await Comment
        .find(filters)
        .sort(req.pagination.sort)
        .skip(req.pagination.limit * (req.pagination.page - 1))
        .limit(req.pagination.limit)
        .populate('user', 'first_name last_name username');

      const totalPages = Math.ceil(totalItems/req.pagination.limit);
      const currentPage = req.pagination.page;
      const limit = req.pagination.limit;

      res.json({
        limit,
        totalPages,
        currentPage,
        totalItems,
        items: comments,
      })
    } catch (error) {
      next(error)
    }
  }
]

module.exports.createComment = () => [
  validateString('content').notEmpty().withMessage('comment cannot be empty'),
  checkValidationError(),
  async (req, res, next) => {
    try {
      const commentData = matchedData(req, { locations: ['body']});
      commentData.user = req.user._id;
      commentData.article = req.params.articleId;

      const comment = await Comment.create(commentData);
      res.status(201).send(comment)
    } catch (error) {
      next(error)
    }
  }
]