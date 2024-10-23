const express       = require('express');
const file_system   = require('../fs_core');
const router        = express.Router();
const requestIp     = require('request-ip');

router.post('/log', async function(req, res) {    
    const IP  = requestIp.getClientIp(req);

    const   path_device = "./data/device/"+req.body.dvid;
    const   date_now    = new Date();
    let     path_log    = path_device+"/"+date_now.getFullYear()+"/";
    delete  req.body.dvid;
    req.body.date = date_now;
    
    if(date_now.getMonth()<10) path_log += "0";
    path_log += date_now.getMonth();
    let     filename    = "";
    if(date_now.getDate()<10) filename += "0";
    filename += date_now.getDate();
    let file_content = JSON.stringify(req.body)+"\r\n";
    
    if(!file_system.check(path_log)) file_system.folderMK(path_log);
    file_system.fileMK(path_device,IP+"\r\n","ip.txt");
    if(file_system.check(path_log+"/"+filename+".csv")){
        file_system.fileADD(path_log,file_content,filename+".csv");
    }else{
        file_system.fileMK(path_log,file_content,filename+".csv");
    }
    
    res.status(201).send("ack");
});

module.exports = router;