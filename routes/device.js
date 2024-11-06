const express       = require('express');
const file_system   = require('../api/fs_core');
const memory_admin  = require('../api/memory_admin');
const file_worker   = require('../worker/file_process');
const router        = express.Router();

router.post('/log', async function(req, res) {    
    const path_device = "./data/device/"+req.body.DVC;
    if(!file_system.check(path_device)) memory_admin.data_renewal();
    const requestIp   = require('request-ip');
    req.body.IP  = requestIp.getClientIp(req);
    response     = await file_worker.device_log(req.body);
    res.status(201).send(response);
});

router.post('/hive_set', async function(req, res) {
    const path_device  = "./data/device/"+req.body.DVC;
    let   file_content = req.body.TMP+","+req.body.RUN;
    file_system.fileMK(path_device,file_content,"device_set.csv");
    file_content += ","+new Date()+"\r\n";
    if(file_system.check(path_device+"/device_set_history.csv")){
        file_system.fileADD(path_device,file_content,"device_set_history.csv");
    }else{
        file_system.fileMK(path_device,file_content,"device_set_history.csv");
    }
    res.status(201).send("ack");
});

module.exports = router;