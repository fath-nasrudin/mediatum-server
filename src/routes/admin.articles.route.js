const router = require('express').Router();
const Article = require('../models/article.model');
const {
  attachUserIfTokenExist,
  checkIsAdmin,
  authenticate,
} = require('../utils/auth');
const articleController = require('../controllers/article.controller');
const commentController = require('../controllers/comment.controller');

router.use([authenticate(), checkIsAdmin()]);

router
  .route('/')
  .get(articleController.getArticleList())
  .post([articleController.createArticle()]);

router
  .route('/:articleId/comments')
  .get([commentController.getCommentListByArticleIdParam()])
  .post([commentController.createComment()]);

router
  .route('/:articleId/comments/:id')
  .put([commentController.editComment()])
  .delete([commentController.deleteComment()]);

router
  .route('/:id')
  .get([articleController.getArticleById()])
  .put([articleController.updateArticle()])
  .delete([articleController.deleteArticleByIdParam()]);

module.exports = router;
