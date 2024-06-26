const router = require('express').Router();

router.route('/').get((req, res) => {res.send('HEllo WOrld')})

router.use('/auth', require('./auth.route'))
router.use('/articles', require('./articles.route'))

module.exports = router;

