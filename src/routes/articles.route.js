const router = require('express').Router();


router.route('/')
  .get((req, res, next) => {
    res.json({message: 'Access articles endpoint'})
  })
module.exports = router;

