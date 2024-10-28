const express   = require('express');
const router    = express.Router();

const web       = require('./web');
const device    = require('./device');
const user      = require('./user');
const hive      = require('./hive');
const pump      = require('./pump');

router.route("/")
    .get(async function(req, res) {
        res.redirect("web/");
    })
    .post(async function(req, res) {
        const response = {header:req.headers,body:req.body}
        res.status(201).send(response);
    });
router.use('/web',web);
router.use('/device',device);
router.use('/user',user);
router.use('/hive',hive);
router.use('/pump',pump);

module.exports  = router;