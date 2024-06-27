const Comment = require('../models/comment.model');

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
  async (req, res, next) => {
    res.send('hit create comment')
  }
]