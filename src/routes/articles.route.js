const router = require('express').Router();
const Article = require('../models/article.model');
const {
  attachUserIfTokenExist,
  checkIsAdmin,
  authenticate,
} = require('../utils/auth');
const articleController = require('../controllers/article.controller');
const commentController = require('../controllers/comment.controller');

router
  .route('/')
  .get([attachUserIfTokenExist(), articleController.getArticleList()])
  .post([authenticate(), checkIsAdmin(), articleController.createArticle()]);

router
  .route('/:articleId/comments')
  .get([commentController.getCommentListByArticleIdParam()])
  .post([authenticate(), commentController.createComment()]);

router
  .route('/:articleId/comments/:id')
  .put([authenticate(), commentController.editComment()])
  .delete([authenticate(), commentController.deleteComment()]);

router
  .route('/:id')
  .get([attachUserIfTokenExist(), articleController.getArticleById()])
  .put([authenticate(), checkIsAdmin(), articleController.updateArticle()])
  .delete([articleController.deleteArticleByIdParam()]);
module.exports = router;
