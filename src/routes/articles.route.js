const router = require('express').Router();
const Article = require('../models/article.model');
const { attachUserIfTokenExist, checkIsAdmin, authenticate } = require('../utils/auth')
const articleController = require('../controllers/article.controller');
const commentController = require('../controllers/comment.controller');
 
const extractProperties = (obj, properties) => {
    return properties.reduce((result, property) => {
        if (obj.hasOwnProperty(property)) {
            result[property] = obj[property];
        }
        return result;
    }, {});
};

router.route('/')
  .get([
    attachUserIfTokenExist(),
    async (req, res, next) => {
      try {
        const {
          page = 1,
          limit = 0,
          sort,
          ...urlQueries
        } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const sortString = (sort) ? sort.split(/[,;]/).join(' ') : null;
        let filters = extractProperties(urlQueries, ['is_published']);

        const isAdmin = req.user && req.user.is_admin;
        let selectString =  !isAdmin ? '-is_published' : '' ;
        selectString += ' -content'
        const currentPage = (!limitNumber) ? 1 : pageNumber;

        // if the requester not an admin, hide the unpublished articles
        if (!isAdmin) filters = { ...filters, is_published: true };


        const items = await Article.find(filters)
          .sort(sortString)
          .skip((pageNumber - 1) * limitNumber)
          .limit(limitNumber)
          .select(selectString)
          .populate('user', 'first_name last_name username');
        const totalItems = await Article.countDocuments(filters);
        const totalPages = (!limitNumber) ? 1 : Math.ceil(totalItems / limitNumber);

        res.json({
          limitNumber,
          totalItems,
          totalPages,
          currentPage,
          items,
        });
      } catch (error) {
        next(error)
      }
    }
  ])
  .post([
    authenticate(),
    checkIsAdmin(),
    articleController.createArticle(),
  ])

router.route('/:articleId/comments')
  .get([
    commentController.getCommentListByArticleIdParam(),
  ])
  .post([
    authenticate(),
    commentController.createComment()
  ])

router.route('/:articleId/comments/:id')
  .put([
    authenticate(),
    commentController.editComment(),
  ])
  .delete([
    authenticate(),
    commentController.deleteComment()
  ])

router.route('/:id')
  .get([
    attachUserIfTokenExist(),
    articleController.getArticleById()
  ])
  .put([
    authenticate(),
    checkIsAdmin(),
    articleController.updateArticle(),
  ])
  .delete([
    articleController.deleteArticleByIdParam()
  ])
module.exports = router;

