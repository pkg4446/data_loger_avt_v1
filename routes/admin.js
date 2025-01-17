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
    if(file_system.check(path_admin+"/token.json")){
        const valid_count = 999;
        const admin_token = JSON.parse(file_system.fileRead(path_admin,"token.json"));
        for (let index = 0; index < admin_token.length; index++) {
            if(admin_token[index].token == token && ++admin_token[index].valid < valid_count){
                response = true;
                file_system.fileMK(path_admin,JSON.stringify(admin_token),"token.json");
                break;
            }
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
        function new_key() {
            const token_key = {
                "key": crypto.randomBytes(4).toString('hex'),
                "valid": 0
            };
            return JSON.stringify(token_key);
        }
        const path_admin = path_data.admin();
        if(file_system.check(path_admin+"/key.json")){
            const valid_count = 20;
            const admin_info  = JSON.parse(file_system.fileRead(path_admin,"key.json"));
            if(++admin_info.valid>valid_count){
                status_code = 202;
                file_system.fileMK(path_admin,new_key(),"key.json");
            }else{
                file_system.fileMK(path_admin,JSON.stringify(admin_info),"key.json");
                if(admin_info.key == admin_data.key){
                    status_code       = 200;
                    const token_admin = [{token:crypto.randomBytes(16).toString('hex'),valid:0}];
                    if(file_system.check(path_admin+"/token.json")){
                        admin_tokens = JSON.parse(file_system.fileRead(path_admin,"token.json"));
                        for (let index = 0; index < admin_tokens.length; index++) {
                            token_admin.push(admin_tokens[index]);
                            if(index == 3) break; //동시 로그인 제한
                        }
                    }
                    file_system.fileMK(path_admin,JSON.stringify(token_admin),"token.json");
                    response = token_admin[0].token;
                }else{
                    status_code = 403;
                    response    = "fail";
                }
            }
        }else{
            status_code = 202;
            file_system.folderMK(path_admin);
            file_system.fileMK(path_admin,new_key(),"key.json");
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