var express = require('express');
const { route } = require('.');
var router = express.Router();
const jwt = require("jsonwebtoken");
const io = require('../bin/www');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
//JWT
router.post('/login', function (req, res, next) {
  var token = jwt.sign({}, 'hungmap123', {
    algorithm: "HS256",
    expiresIn: '1h',
  })
  res.json(token)
});

router.use(function (req, res, next) {
  if (req.header && req.headers.authorization) {
    var token = req.headers.authorization
    console.log(token)
    jwt.verify(token, 'hungmap123', function (err, decode) {
      if (err)
        return res.status(403).send({ message: 'Token Fail' })
      else return next()
    })
  } else
    return res.send({
      message: 'Access Fail'
    })
})


router.post('/logintoChat', function (req, res, next) {
  res.send({ message: 'success' })
});



module.exports = router;
