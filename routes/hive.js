const express       = require('express');
const file_system   = require('../fs_core');
const router        = express.Router();

router.post('/connect', async function(req, res) {
    let status_code = 400;
    const user_data = req.body;
    if(user_data.id!=undefined && user_data.token!=undefined && user_data.dvid!=undefined && user_data.name!=undefined && user_data.name.length>0){
        user_data.name = user_data.name.replaceAll(' ',"_");
        const   path_user   = "./data/user/"+user_data.id;
        const   path_device = "./data/device/"+user_data.dvid;
        if(file_system.check(path_user+"/login.txt")){
            if(file_system.check(path_user) && file_system.fileRead(path_user,"login.txt")==user_data.token){
                if(file_system.check(path_device)){
                    if(file_system.check(path_device+"/owner.txt")){
                        status_code = 409;
                    }else{
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
                            if(!device_duplication) file_system.fileADD(path_user,user_data.dvid+","+user_data.name+"\r\n","device.csv");
                        }else{
                            file_system.fileMK(path_user,user_data.dvid+","+user_data.name+"\r\n","device.csv");
                        }
                        file_system.fileMK(path_device,user_data.id,"owner.txt")
                    }
                }else{
                    status_code = 403;
                }
            }else{
                status_code = 401;
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
        if(file_system.check(path_user+"/login.txt")){
            if(file_system.check(path_user) && file_system.fileRead(path_user,"login.txt")==user_data.token){
                if(file_system.check(path_device)){
                    if(file_system.check(path_device+"/owner.txt")){
                        status_code = 200;
                        file_system.fileDel(path_device,"owner.txt");
                        const list   = file_system.fileRead(path_user,"device.csv").split("\r\n");
                        let new_list = "";
                        for (let index = 0; index < list.length-1; index++) {
                            if(list[index].split(",")[0] != user_data.dvid){
                                new_list += list[index] + "\r\n";
                            }
                        }
                        file_system.fileMK(path_user,new_list,"device.csv");
                    }
                }else{
                    status_code = 403;
                }
            }else{
                status_code = 401;
            }
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
        const   path_device = "./data/device/"+user_data.dvid;
        if(file_system.check(path_user+"/login.txt")){
            if(file_system.check(path_user) && file_system.fileRead(path_user,"login.txt")==user_data.token){
                status_code = 200;
                const list   = file_system.fileRead(path_user,"device.csv").split("\r\n");
                let new_list = "";
                for (let index = 0; index < list.length-1; index++) {
                    if(list[index].split(",")[0] === user_data.dvid){
                        new_list += user_data.dvid+","+user_data.name+"\r\n"
                    }else{
                        new_list += list[index] + "\r\n";
                    }
                }
                file_system.fileMK(path_user,new_list,"device.csv");
            }else{
                status_code = 401;
            }
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
        const   path_user   = "./data/user/"+user_data.id;
        const   path_device = "./data/device/"+user_data.dvid;
        if(file_system.check(path_user+"/login.txt")){
            if(file_system.check(path_user) && file_system.fileRead(path_user,"login.txt")==user_data.token){
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
        if(file_system.check(path_user+"/login.txt")){
            if(file_system.check(path_user) && file_system.fileRead(path_user,"login.txt")==user_data.token){
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
            response    = "";
            const device_list = file_system.Dir(path_device);
            for (let index = 0; index < device_list.length; index++) {
                if(!file_system.check(path_device+"/"+device_list[index]+"/owner.txt")){
                    if(file_system.check(path_device+"/"+device_list[index]+"/ip.txt")){
                        const requestIp = require('request-ip');
                        const conn_ip   = requestIp.getClientIp(req);
                        const device_ip = file_system.fileRead(path_device+"/"+device_list[index],"ip.txt");
                        if(device_ip == conn_ip){
                            response += device_list[index]+',';
                        }else{}
                    }else{}
                }
            }            
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
        const   path_user   = "./data/user/"+user_data.id;
        const   path_device = "./data/device/"+user_data.dvid;
        if(file_system.check(path_user+"/login.txt")){
            if(file_system.check(path_user) && file_system.fileRead(path_user,"login.txt")==user_data.token){
                if(file_system.check(path_device+"/owner.txt")&&(file_system.fileRead(path_device,"owner.txt")==user_data.id)){
                    status_code = 200;
                    if(file_system.check("./data/device/"+user_data.dvid+"/lastest.csv")){
                        response = file_system.fileRead("./data/device/"+user_data.dvid,"lastest.csv");
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
        const   path_user   = "./data/user/"+user_data.id;
        const   path_device = "./data/device/"+user_data.dvid;
        if(file_system.check(path_user+"/login.txt")){
            if(file_system.check(path_user) && file_system.fileRead(path_user,"login.txt")==user_data.token){
                if(file_system.check(path_device+"/owner.txt")&&(file_system.fileRead(path_device,"owner.txt")==user_data.id)){
                    status_code = 200;
                    response    = "ok";
                    if(user_data.date[1]<10){
                        const temp_num = user_data.date[1];
                        user_data.date[1] = "0"+temp_num;
                    }
                    let yesterday = user_data.date[2]-1;
                    if(user_data.date[2]<10){
                        const temp_num = user_data.date[2];
                        user_data.date[2] = "0"+temp_num;
                        yesterday = "0"+(temp_num-1);
                    }
                    if(file_system.check("./data/device/"+user_data.dvid+"/"+user_data.date[0]+"/"+user_data.date[1]+"/"+user_data.date[2]+".csv")){
                        response    = "log\r\n" + file_system.fileRead("./data/device/"+user_data.dvid+"/"+user_data.date[0]+"/"+user_data.date[1],user_data.date[2]+".csv");
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
        }else{
            status_code = 401;
            response    = "user";
        }
    }
    res.status(status_code).send(response);
});

module.exports = router;