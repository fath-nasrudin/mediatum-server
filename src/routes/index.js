const router = require('express').Router();

router.route('/').get((req, res) => {res.send('HEllo WOrld')})

router.use('/auth', require('./auth.route'))
router.use('/articles', require('./articles.route'))
router.use('/admin/articles', require('./admin.articles.route'))


module.exports = router;

