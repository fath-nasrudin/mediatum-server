const Comment = require('./article.controller');

module.exports.getCommentListByArticleIdParam = () => [
  async (req, res, next) => {
    res.send({
      message: 'hit artilcleId/comments endpoint',
      articleId: req.params.articleId,
      id: req.params.id,
    })
  }
]