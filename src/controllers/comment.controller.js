const Comment = require('../models/comment.model');

module.exports.getCommentListByArticleIdParam = () => [
  async (req, res, next) => {
    try {
      let filters = { article: req.params.articleId };
      const totalItems = await Comment.countDocuments(filters);
      const comments = await Comment.find(filters).populate('user', 'first_name last_name username');

      res.json({
        totalItems,
        items: comments,
      })
    } catch (error) {
      next(error)
    }
  }
]