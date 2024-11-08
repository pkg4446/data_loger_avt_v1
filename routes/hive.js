const express       = require('express');
const file_system   = require('../api/fs_core');
const memory_admin  = require('../api/memory_admin');
const file_worker   = require('../worker/file_process');
const router        = express.Router();

function token_check(token,user_id) {
    let response = false;
    const path_user = "./data/user/"+user_id;
    if(file_system.check(path_user+"/login.txt")){
        const user_token = file_system.fileRead(path_user,"login.txt");
        if(user_token == token){response = true;}
    }
    return response;
}

router.post('/connect', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.name!=undefined && user_data.name.length>0){
        user_data.name = user_data.name.replaceAll(' ',"_");
        const   path_user   = "./data/user/"+user_data.id;
        const   path_device = "./data/device/"+user_data.dvid;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_device+"/owner.txt")){
                status_code = 409;
            }else if(file_system.check(path_device)){
                memory_admin.data_renewal(false);
                status_code = 200;
                const file_content = file_system.fileRead(path_user,"device.csv");
                if(file_content){
                    const devices  = file_content.split("\r\n");
                    let device_duplication = false;
                    for (let index = 0; index < devices.length; index++) {
                        if(devices[index].split(",")[0] == user_data.dvid){
                            device_duplication = true;
                            break;
                        }
                    }
                    if(!device_duplication) file_system.fileADD(path_user,"\r\n"+user_data.dvid+","+user_data.name,"device.csv");
                }else{
                    file_system.fileMK(path_user,user_data.dvid+","+user_data.name,"device.csv");
                }
                file_system.fileMK(path_device,user_data.id,"owner.txt")
            }else{
                status_code = 403;
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/disconnect', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined){
        const   path_user   = "./data/user/"+user_data.id;
        const   path_device = "./data/device/"+user_data.dvid;
        if(token_check(user_data.token,user_data.id)){
            memory_admin.data_renewal(false);
            status_code = 200;
            let new_list = "";
            if(file_system.check(path_device+"/owner.txt")) file_system.fileDel(path_device,"owner.txt");
            if(file_system.check(path_user+"/device.csv")){
                const list     = file_system.fileRead(path_user,"device.csv").split("\r\n");
                let line_shift = false;
                for (let index = 0; index < list.length-1; index++) {
                    if(list[index].split(",")[0] != user_data.dvid){
                        if(line_shift) new_list += "\r\n";
                        else line_shift = true;
                        new_list += list[index];
                    }
                }
            }
            file_system.fileMK(path_user,new_list,"device.csv");
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/devicerename', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined){
        const   path_user   = "./data/user/"+user_data.id;
        if(token_check(user_data.token,user_data.id)){
            status_code = 200;
            const list   = file_system.fileRead(path_user,"device.csv").split("\r\n");
            let new_list = "";
            for (let index = 0; index < list.length-1; index++) {
                if(index != 0) new_list += "\r\n";
                if(list[index].split(",")[0] === user_data.dvid){
                    new_list += user_data.dvid+","+user_data.name;
                }else{
                    new_list += list[index];
                }
            }
            file_system.fileMK(path_user,new_list,"device.csv");
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/heater', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined){
        const   path_device = "./data/device/"+user_data.dvid;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_device)){
                status_code = 200;
                if(user_data.func){
                    file_system.fileMK(path_device,String(user_data.value),"heater_temp.csv");
                }else{
                    file_system.fileMK(path_device,String(user_data.value),"heater_able.csv");
                }
            }else{
                status_code = 403;
            }
        }else{
            status_code = 401;
        }
    }
    res.status(status_code).send();
});

router.post('/list', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined){
        const   path_user   = "./data/user/"+user_data.id;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_user+"/device.csv")){
                status_code = 200;
                response    = file_system.fileRead(path_user,"device.csv");
            }else{
                status_code = 403;
                response    = "device";
            }
        }else{
            status_code = 401;
            response    = "user";
        }
    }
    res.status(status_code).send(response);
});

router.post('/list_able', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined){
        const   path_device = "./data/device";
        if(file_system.check(path_device)){
            status_code = 200;
            const requestIp = require('request-ip');
            const conn_ip   = requestIp.getClientIp(req);
            response = await file_worker.list_able(conn_ip);
        }else{
            status_code = 401;
            response    = "user";
        }
    }
    res.status(status_code).send(response);
});

router.post('/config', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.date!=undefined){
        const   path_device = "./data/device/"+user_data.dvid;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_device+"/owner.txt")&&(file_system.fileRead(path_device,"owner.txt")==user_data.id)){
                status_code = 200;
                if(file_system.check("./data/device/"+user_data.dvid+"/lastest.json")){
                    response = file_system.fileRead("./data/device/"+user_data.dvid,"lastest.json");
                }else{
                    response = "null";
                }
                const response_added = {dv:null,ab:null,th:null};
                if(file_system.check("./data/device/"+user_data.dvid+"/device_set.csv")){
                    response_added.dv = file_system.fileRead("./data/device/"+user_data.dvid,"device_set.csv").split(",");
                }
                if(file_system.check("./data/device/"+user_data.dvid+"/heater_able.csv")){
                    response_added.ab = file_system.fileRead("./data/device/"+user_data.dvid,"heater_able.csv");
                }
                if(file_system.check("./data/device/"+user_data.dvid+"/heater_temp.csv")){
                    response_added.th = file_system.fileRead("./data/device/"+user_data.dvid,"heater_temp.csv").split(",");
                }
                response += "\r\n"+JSON.stringify(response_added);
            }else{
                status_code = 403;
                response    = "device";
            }
        }else{
            status_code = 401;
            response    = "user";
        }
    }
    res.status(status_code).send(response);
});

router.post('/log', async function(req, res) {
    let status_code = 400;
    let response    = "nodata";
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.date!=undefined){
        const   path_device = "./data/device/"+user_data.dvid;
        if(token_check(user_data.token,user_data.id)){
            if(file_system.check(path_device+"/owner.txt")&&(file_system.fileRead(path_device,"owner.txt")==user_data.id)){
                status_code = 200;
                response    = "ok";
                for (let index = 1; index < 3; index++) {if(user_data.date[index]<10){user_data.date[index] = "0"+user_data.date[index];}}
                if(file_system.check("./data/device/"+user_data.dvid+"/"+user_data.date[0]+"/"+user_data.date[1]+"/"+user_data.date[2]+".json")){
                    response    = "log\r\n" + file_system.fileRead("./data/device/"+user_data.dvid+"/"+user_data.date[0]+"/"+user_data.date[1],user_data.date[2]+".json");
                }else{
                    response = "null";
                }
            }else{
                status_code = 403;
                response    = "device";
            }
        }else{
            status_code = 401;
            response    = "user";
        }
    }
    res.status(status_code).send(response);
});

module.exports = router;