const Comment = require('../models/comment.model');
const {
  checkValidationError,
  matchedData,
  validateString,
  validateId,
  removeUnregisteredBodyProperties,
} = require('../utils/inputValidation');
const { ApiError } = require('../utils/error');

module.exports.getCommentListByArticleIdParam = () => [
  // pagination handler
  (req, res, next) => {
    const { page = 1, limit = 5, sort = '-created_at', ...Queries } = req.query;
    req.pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      Queries,
    };
    next();
  },
  async (req, res, next) => {
    try {
      let filters = { article: req.params.articleId };
      const totalItems = await Comment.countDocuments(filters);
      const comments = await Comment.find(filters)
        .sort(req.pagination.sort)
        .skip(req.pagination.limit * (req.pagination.page - 1))
        .limit(req.pagination.limit)
        .populate('user', 'first_name last_name username');

      const totalPages = Math.ceil(totalItems / req.pagination.limit);
      const currentPage = req.pagination.page;
      const limit = req.pagination.limit;

      res.json({
        limit,
        totalPages,
        currentPage,
        totalItems,
        items: comments,
      });
    } catch (error) {
      next(error);
    }
  },
];

module.exports.createComment = () => [
  validateString('content').notEmpty().withMessage('comment cannot be empty'),
  checkValidationError(),
  async (req, res, next) => {
    try {
      const commentData = matchedData(req, { locations: ['body'] });
      commentData.user = req.user._id;
      commentData.article = req.params.articleId;

      const comment = await Comment.create(commentData);
      res.status(201).send(comment);
    } catch (error) {
      next(error);
    }
  },
];

module.exports.editComment = () => [
  validateString('content').notEmpty().withMessage('comment cannot be empty'),

  validateId('id', { location: 'param' }),

  checkValidationError(),
  removeUnregisteredBodyProperties(),

  async (req, res, next) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment)
        throw new ApiError(
          404,
          `Comment with id ${req.params.id} is not found`
        );

      // if the requester not own the comment, send 403;
      if (req.user?._id.toString() !== comment.user.toString())
        throw new ApiError(403, `Not Allowed`);

      const updatedComment = await Comment.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedComment)
        throw new ApiError(
          404,
          `Comment with id ${req.params.id} is not found`
        );

      res.json(updatedComment);
    } catch (error) {
      next(error);
    }
  },
];

module.exports.deleteComment = () => [
  validateId('id', { location: 'param' }),
  checkValidationError(),

  async (req, res, next) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment)
        throw new ApiError(
          404,
          `Comment with id ${req.params.id} is not found`
        );

      // not allowed if the requester is not admin or owner of the comment
      const isOwner = req.user?._id.toString() === comment.user.toString();
      const isAdmin = req.user?.is_admin;
      if (!isOwner && !isAdmin) throw new ApiError(403, `Not Allowed`);

      const deletedComment = await Comment.findByIdAndDelete(req.params.id);
      if (!deletedComment)
        throw new ApiError(
          404,
          `Comment with id ${req.params.id} is not found`
        );

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
];
