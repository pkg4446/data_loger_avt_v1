const express   = require('express');
const html      = require('../html_viewer');
const router    = express.Router();

router.get('/', async function(req, res) {
    const css = html.css("main") + html.css("hive");
    const js  = html.js("main");
    const web_page = html.page("index",css,js);
    res.status(201).send(web_page);
});

router.get('/login', async function(req, res) {
    const css = html.css("main") + html.css("user");
    const js  = html.js("login");
    let web_page = html.page("login",css,js);
    res.status(201).send(web_page);
});

router.get('/join', async function(req, res) {
    const css = html.css("main") + html.css("user");
    const js  = html.js("join");
    let web_page = html.page("join",css,js);
    res.status(201).send(web_page);
});

router.get('/connect', async function(req, res) {
    const css = html.css("main") + html.css("user");
    const js  = html.js("device_reg");
    let web_page = html.page("device_reg",css,js);
    res.status(201).send(web_page);
});

router.get('/select', async function(req, res) {
    const css = html.css("main") + html.css("list");
    const js  = html.js("device_list");
    let web_page = html.page("list",css,js);
    res.status(201).send(web_page);
});
module.exports = router;