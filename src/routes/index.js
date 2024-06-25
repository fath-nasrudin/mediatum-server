const router = require('express').Router();

router.route('/').get((req, res) => {res.send('HEllo WOrld')})

module.exports = router;

