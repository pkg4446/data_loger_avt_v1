const { parentPort } = require('worker_threads');
const file_system   = require("../../api/fs_core");

parentPort.on('message', (conn_ip) => {
    let response = "";
    const   path_device = "./data/device";
    const device_list = file_system.Dir(path_device);
    for (let index = 0; index < device_list.length; index++) {
        if(!file_system.check(path_device+"/"+device_list[index]+"/owner.txt")){
            if(file_system.check(path_device+"/"+device_list[index]+"/ip.txt")){
                const requestIp = require('request-ip');
                const device_ip = file_system.fileRead(path_device+"/"+device_list[index],"ip.txt");
                if(device_ip == conn_ip){
                    response += device_list[index]+',';
                }else{}
            }else{}
        }
    }  
    // 결과를 메인 스레드로 전송
    parentPort.postMessage(response);
});