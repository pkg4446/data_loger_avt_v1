const express       = require('express');
const file_system   = require('../api/fs_core');
const router        = express.Router();

router.post('/connect', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.name!=undefined && user_data.name.length>0){
        status_code = 200;
    }
    res.status(status_code).send();
});

module.exports = router;