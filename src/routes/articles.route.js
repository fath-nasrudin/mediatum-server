const router = require('express').Router();
const Article = require('../models/article.model');


router.route('/')
  .get(async (req, res, next) => {
    try {
      const articles = await Article.find();
      res.json(articles);
    } catch (error) {
      next(error)
    }
  })
module.exports = router;

