const express       = require('express');
const file_system   = require('../api/fs_core');
const memory_admin  = require('../api/memory_admin');
const router        = express.Router();
const requestIp     = require('request-ip');

router.post('/log', async function(req, res) {    
    const   IP  = requestIp.getClientIp(req);
    const   path_device = "./data/device/"+req.body.DVC;
    const   date_now    = new Date();
    let     path_log    = path_device+"/"+date_now.getFullYear()+"/";
    delete  req.body.DVC;
    req.body.date = date_now;
    
    if(date_now.getMonth()<10) path_log += "0";
    path_log += date_now.getMonth();
    let filename = "";
    if(date_now.getDate()<10) filename += "0";
    filename += date_now.getDate();
    let file_content = JSON.stringify(req.body);
    
    if(!file_system.check(path_log)){
        file_system.folderMK(path_log);
        memory_admin.data_renewal();
    }
    file_system.fileMK(path_device,IP,"ip.txt");
    file_system.fileMK(path_device,file_content,"lastest.json");
    file_content += "\r\n";
    if(file_system.check(path_log+"/"+filename+".json")){
        file_system.fileADD(path_log,file_content,filename+".json");
    }else{
        file_system.fileMK(path_log,file_content,filename+".json");
    }
    
    let response = "set,";
    if(file_system.check(path_device+"/heater_temp.csv")) response += file_system.fileRead(path_device,"heater_temp.csv");
    else response += "0";
    response += ",";
    if(file_system.check(path_device+"/heater_able.csv")) response += file_system.fileRead(path_device,"heater_able.csv");
    else response += "0";

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