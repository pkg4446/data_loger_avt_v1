const express       = require('express');
const file_worker = require('../worker/file_process');
const router        = express.Router();

router.post('/hive_stat', async function(req, res) {
    let status_code  = 200;
    let response = await file_worker.hive_stat()
    res.status(status_code).send(response);
});

module.exports = router;