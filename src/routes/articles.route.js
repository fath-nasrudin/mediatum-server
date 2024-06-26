const router = require('express').Router();
const Article = require('../models/article.model');
const { attachUserIfTokenExist, checkIsAdmin, authenticate } = require('../utils/auth')
const articleController = require('../controllers/article.controller');

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
        const filters = extractProperties(urlQueries, ['is_published']);
        const selectString = !req.user || !req.user.is_admin ? 'title createdAt' : null ;
        const currentPage = (!limitNumber) ? 1 : pageNumber;


        const items = await Article.find(filters)
          .sort(sortString)
          .skip((pageNumber - 1) * limitNumber)
          .limit(limitNumber)
          .select(selectString);
        const totalItems = await Article.countDocuments();
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

router.route('/:id')
  .post([
    articleController.updateArticle(),
  ])
module.exports = router;

