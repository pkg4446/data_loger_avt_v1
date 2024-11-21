const express   = require('express');
const router    = express.Router();

const web       = require('./web');
const admin     = require('./admin');
const common    = require('./common');
const device    = require('./device');
const firmware  = require('./firmware');
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
router.use('/admin',admin);
router.use('/common',common);
router.use('/device',device);
router.use('/firmware',firmware);
router.use('/user',user);
router.use('/hive',hive);
router.use('/pump',pump);

module.exports  = router;