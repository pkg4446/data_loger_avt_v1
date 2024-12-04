const crypto        = require("crypto");
const express       = require('express');
const file_system   = require('../api/fs_core');
const memory_admin  = require('../api/memory_admin');
const device        = require('../api/device');
const path_data     = require('../api/path_data');
const file_data     = require('../api/file_data');

const router        = express.Router();

function token_check(token) {
    let response = false;
    const path_admin = path_data.admin();
    if(file_system.check(path_admin+"/token.txt")){
        const valid_count = 999;
        const admin_token = file_system.fileRead(path_admin,"token.txt");
        const token_valid = parseInt(file_system.fileRead(path_admin,"token_valid.txt"))+1;
        if(admin_token == token && token_valid < valid_count){
            response = true;
            file_system.fileMK(path_admin,""+token_valid,"token_valid.txt");
        }
    }
    return response;
}

router.post('/check', async function(req, res) {
    let status_code  = 400;
    const admin_data = req.body;
    if(admin_data.token!=undefined){
        if(token_check(admin_data.token)){status_code = 200;}
    }
    res.status(status_code).send();
});

router.post('/superuser', async function(req, res) {
    let status_code  = 400;
    let response     = "fail";
    const admin_data = req.body;
    if(admin_data.token!=undefined){
        const path_user  = path_data.user()+"/" + admin_data.userid;
        if(!file_system.check(path_user+"/login.txt")){
            const loginfo   = crypto.randomBytes(16).toString('hex');
            file_system.fileMK(path_user,loginfo,"login.txt");
        }
        if(token_check(admin_data.token)){
            const requestIp = require('request-ip');
            const IP    = requestIp.getClientIp(req);
            status_code = 200;
            response = file_system.fileRead(path_user,"login.txt");
            const login_log = new Date() + "," + IP;
            if(file_system.check(path_user+"/login_log.csv")) file_system.fileADD(path_user,"\r\n"+login_log,"login_log.csv");
            else file_system.fileMK(path_user,login_log,"login_log.csv");
        }else{
            status_code = 403; 
        }
    }
    res.status(status_code).send(response);
});

router.post('/authority', async function(req, res) {
    let status_code  = 400;
    let response     = "key";
    const admin_data = req.body;
    if(admin_data.key!=undefined){
        const path_admin = path_data.admin();
        if(file_system.check(path_admin+"/key.txt") && file_system.check(path_admin+"/key_valid.txt")){
            const valid_count = 20;
            const admin_info  = {
                key  :  null,
                valid : parseInt(file_system.fileRead(path_admin,"key_valid.txt"))+1
            };
            if(admin_info.valid>valid_count){
                admin_info.key   = crypto.randomBytes(4).toString('hex');
                admin_info.valid = 0;
                status_code      = 202;
                file_system.fileMK(path_admin,admin_info.key,"key.txt");
            }else{
                admin_info.key   = file_system.fileRead(path_admin,"key.txt");
                if(admin_info.key == admin_data.key){
                    status_code       = 200;
                    const admin_token = crypto.randomBytes(16).toString('hex');
                    file_system.fileMK(path_admin,admin_token,"token.txt");
                    file_system.fileMK(path_admin,"0","token_valid.txt");
                    response = admin_token;
                }else{
                    status_code = 403;
                    response    = "fail";
                }
            }
            file_system.fileMK(path_admin,""+admin_info.valid,"key_valid.txt");
        }else{
            status_code = 202;
            file_system.folderMK(path_admin);
            const randombyte = crypto.randomBytes(4).toString('hex');
            file_system.fileMK(path_admin,"0","key_valid.txt");
            file_system.fileMK(path_admin,randombyte,"key.txt");
            response    = "new";
        }
    }
    res.status(status_code).send(response);
});

router.post('/list_data', async function(req, res) {
    let status_code  = 400;
    let response     = "token";
    const admin_data = req.body;
    if(admin_data.token!=undefined){
        status_code = 403;
        if(token_check(admin_data.token)){
            status_code = 200;
            response = await memory_admin.data_get();
            response.device.ver = file_system.fileRead(path_data.firmware(),file_data.firmware());
            response = JSON.stringify(response);
        }
    }
    res.status(status_code).send(response);
});

router.post('/firmware', async function(req, res) {
    let status_code  = 400;
    let response     = "token";
    const admin_data = req.body;
    if(admin_data.token!=undefined){
        status_code = 403;
        if(token_check(admin_data.token)){
            status_code = 200;
            response = file_system.fileMK(path_data.device()+"/"+req.body.dvid,"1",file_data.firmware_update());
        }
    }
    res.status(status_code).send(response);
});

router.post('/connect', async function(req, res) {
    let status_code = 400;
    const admin_data = req.body;
    if(admin_data.token!=undefined && admin_data.user!=undefined && admin_data.dvid!=undefined){
        if(token_check(admin_data.token)){
            status_code = await device.connect(admin_data.user,admin_data.dvid,"벌통");
        }else{
            status_code = 406;
        }
    }
    res.status(status_code).send();
});

router.post('/disconnect', async function(req, res) {
    let status_code = 400;
    const admin_data = req.body;
    if(admin_data.token!=undefined && admin_data.user!=undefined && admin_data.dvid!=undefined){
        if(token_check(admin_data.token)){
            status_code = await device.disconnect(admin_data.user,admin_data.dvid);
        }else{
            status_code = 406;
        }
    }
    res.status(status_code).send();
});

module.exports = router;