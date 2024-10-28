const crypto        = require("crypto");
const express       = require('express');
const file_system   = require('../fs_core');
const router        = express.Router();

router.post('/login', async function(req, res) {
    let status_code  = 400;
    let response     = "nodata";
    const login_data = req.body;
    if(login_data.id!=undefined&&login_data.pass!=undefined){
        const path_user = "./data/user/"+login_data.id;
        if(file_system.check(path_user+"/config.csv")){
            const user_config = file_system.fileRead(path_user,"config.csv").split(",");
            if(crypto.createHash("sha256").update(login_data.pass+user_config[0]).digest("base64") == user_config[1]){
                status_code     = 200;
                const loginfo   = crypto.randomBytes(16).toString('hex');
                file_system.fileMK(path_user,loginfo,"login.txt");
                response        = loginfo;
            }else{
                status_code = 403;
                response    = "password";
            }
        }else{
            status_code = 406;
            response    = "userid";
        }
    }
    res.status(status_code).send(response);
});

router.post('/info', async function(req, res) {
    let status_code  = 400;
    let response     = "nodata";
    const login_data = req.body;
    if(login_data.id!=undefined&&login_data.token!=undefined){
        const path_user = "./data/user/"+login_data.id;
        if(file_system.check(path_user+"/config.csv") && file_system.check(path_user+"/login.txt")){
            status_code = 200;
            const user_config = file_system.fileRead(path_user,"config.csv").split(",");
            response = user_config[3]+","+user_config[4]+","+user_config[5]+","+user_config[6];
        }else{
            status_code = 406;
            response    = "userid";
        }
    }
    res.status(status_code).send(response);
});

router.post('/join', async function(req, res) {
    let status_code = 400;
    const join_data = req.body;
    if(join_data.id!=undefined && join_data.pass!=undefined && join_data.check!=undefined){
        status_code = 403;
        const   path_user = "./data/user/"+join_data.id;
        if(file_system.check(path_user)){
            status_code = 406;
        }else if(join_data.pass == join_data.check){
            status_code = 200;
            file_system.folderMK(path_user);
            const randombyte = crypto.randomBytes(4).toString('hex');
            let file_content = randombyte+","+crypto.createHash("sha256").update(join_data.pass+randombyte).digest("base64")+","+(new Date())+","+
            join_data.name+","+join_data.farm+","+join_data.addr+","+join_data.tel+"\r\n";
            file_system.fileMK(path_user,file_content,"config.csv");
        }
    }
    res.status(status_code).send();
});

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
                        response    = "success";
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


router.post('/dvlog', async function(req, res) {
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
                    if(file_system.check("./data/device/"+user_data.dvid+"/lastest.csv")){
                        response    = file_system.fileRead("./data/device/"+user_data.dvid,"lastest.csv");
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