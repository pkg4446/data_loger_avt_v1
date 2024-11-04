const crypto        = require("crypto");
const express       = require('express');
const file_system   = require('../fs_core');
const router        = express.Router();


router.post('/check', async function(req, res) {
    let status_code  = 400;
    const admin_data = req.body;
    if(admin_data.TOKEN!=undefined){
        const path_admin = "./data/admin";
        if(file_system.check(path_admin+"/token.txt")){
            const admin_token = file_system.fileRead(path_admin,"token.txt");
            if(admin_token==admin_data.TOKEN){
                status_code = 200;
            }
        }
    }
    res.status(status_code).send();
});

router.post('/authority', async function(req, res) {
    let status_code  = 400;
    let response     = "key";
    const admin_data = req.body;
    if(admin_data.KEY!=undefined){
        const path_admin = "./data/admin";
        if(file_system.check(path_admin+"/key.csv")){
            const admin_key = file_system.fileRead(path_admin,"key.csv").split(",");
            if(admin_key[0]==admin_data.KEY){
                status_code       = 200;
                const admin_token = crypto.randomBytes(16).toString('hex');
                file_system.fileMK(path_admin,admin_token,"token.txt");
                response = admin_token;
            }else{
                status_code = 403;
                response    = "fail";
                const try_count = 5;
                const key_save  = {
                    key   : admin_key[0],
                    count : parseInt(admin_key[1])+1
                };
                if(key_save.count>try_count){
                    key_save.key   = crypto.randomBytes(4).toString('hex');
                    key_save.count = 0;
                    status_code    = 202;
                }
                file_system.fileMK(path_admin,key_save.key+","+key_save.count,"key.csv");
            }
        }else{
            status_code = 202;
            file_system.folderMK(path_admin);
            const randombyte = crypto.randomBytes(4).toString('hex');
            file_system.fileMK(path_admin,randombyte+",0","key.csv");
            response    = "new";
        }
    }
    res.status(status_code).send(response);
});

router.post('/list_data', async function(req, res) {
    let status_code  = 400;
    let response     = "token";
    const admin_data = req.body;
    if(admin_data.TOKEN!=undefined){
        status_code = 403;
        const path_admin  = "./data/admin";
        const admin_token = file_system.fileRead(path_admin,"token.txt");
        if(admin_token.TOKEN == admin_data.token){
            status_code = 200;
            const path_user   = "./data/user";
            const path_device = "./data/device";
            const user_list   = file_system.Dir(path_user);
            const device_list = file_system.Dir(path_device);
            response = {user:{},device:{}};
            for (let index = 0; index < user_list.length; index++) {
                const user_path = path_user+"/"+user_list[index];
                if(file_system.check(user_path+"/config.csv")){
                    const user_info = file_system.fileRead(user_path,"config.csv").split(",");
                    response.user[user_list[index]] = {
                        date:user_info[2],
                        name:user_info[3],
                        farm:user_info[4],
                        addr:user_info[5],
                        tel :user_info[6]
                    };
                }else{
                    response.user[user_list[index]] = {date:null,name:null,farm:null,addr:null,tel :null};
                }
            }
            for (let index = 0; index < device_list.length; index++) {
                const device_path = path_device+"/"+device_list[index];
                const device_ip = file_system.fileRead(device_path,"ip.txt");
                if(response.device[device_ip] == undefined) response.device[device_ip] = {};
                response.device[device_ip][device_list[index]] = {USER:file_system.fileRead(device_path,"owner.txt")}
            }
            response = JSON.stringify(response);
        }
    }
    res.status(status_code).send(response);
});

router.post('/connect', async function(req, res) {
    let status_code = 400;
    const admin_data = req.body;
    if(admin_data.TOKEN!=undefined && admin_data.user!=undefined && admin_data.dvid!=undefined){
        const path_admin  = "./data/admin";
        const admin_token = file_system.fileRead(path_admin,"token.txt");
        if(admin_token.TOKEN == admin_data.token){
            const path_user   = "./data/user/"+admin_data.user;
            const path_device = "./data/device/"+admin_data.dvid;
            if(file_system.check(path_user) && file_system.check(path_device)){
                if(file_system.check(path_device+"/owner.txt")){
                    status_code = 409;
                }else{
                    status_code = 200;
                    const file_content = file_system.fileRead(path_user,"device.csv");
                    if(file_content){
                        const devices  = file_content.split("\r\n");
                        let device_duplication = false;
                        for (let index = 0; index < devices.length; index++) {
                            if(devices[index].split(",")[0] == admin_data.dvid){
                                device_duplication = true;
                                break;
                            }
                        }
                        if(!device_duplication) file_system.fileADD(path_user,admin_data.dvid+","+"벌통"+"\r\n","device.csv");
                    }else{
                        file_system.fileMK(path_user,admin_data.dvid+","+"벌통"+"\r\n","device.csv");
                    }
                    file_system.fileMK(path_device,admin_data.user,"owner.txt");
                }
            }else{
                status_code = 401;
            }
        }else{
            status_code = 403;
        }


    }
    res.status(status_code).send();
});

module.exports = router;