const express   = require('express');
const html      = require('../html_viewer');
const router    = express.Router();

router.get('/', async function(req, res) {
    const css = html.css("main") + html.css("list");
    let   js  = html.js("device_list");
          js += html.js("sweetalert2");
    let web_page = html.page("device_list",css,js);
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
    let   js  = html.js("device_reg");
          js += html.js("sweetalert2");
    let web_page = html.page("device_reg",css,js);
    res.status(201).send(web_page);
});

router.get('/select', async function(req, res) {
    const css = html.css("main") + html.css("log");
    let   js  = html.js("device_log");
          js += `<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>`;
    let web_page = html.page("device_log",css,js);
    res.status(201).send(web_page);
});
module.exports = router;