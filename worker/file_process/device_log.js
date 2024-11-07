const { parentPort } = require('worker_threads');
const file_system   = require("../../api/fs_core");

parentPort.on('message', (device) => {
    const   path_device = "./data/device/"+device.DVC;
    delete  device.DVC;
    device.date = new Date();

    let path_log = path_device+"/"+device.date.getFullYear()+"/";
    
    if(device.date.getMonth()<10) path_log += "0";
    path_log += device.date.getMonth();
    let filename = "";
    if(device.date.getDate()<10) filename += "0";
    filename += device.date.getDate();
    let file_content = JSON.stringify(device);

    if(!file_system.check(path_log)){file_system.folderMK(path_log);}
    
    if(file_system.check(path_device+"/ip.txt")){
        if(file_system.fileRead(path_device,"ip.txt") != device.IP) file_system.fileMK(path_device,device.IP,"ip.txt");
    }else file_system.fileMK(path_device,device.IP,"ip.txt");

    file_system.fileMK(path_device,file_content,"lastest.json");
    file_content += "\r\n";
    if(file_system.check(path_log+"/"+filename+".json")){
        file_system.fileADD(path_log,file_content,filename+".json");
    }else{
        file_system.fileMK(path_log,file_content,filename+".json");
    }
    
    let response = "set,";
    if(file_system.check(path_device+"/heater_temp.csv")) response += file_system.fileRead(path_device,"heater_temp.csv");
    else response += "3,3,3,3,3";
    response += ",";
    if(file_system.check(path_device+"/heater_able.csv")) response += file_system.fileRead(path_device,"heater_able.csv");
    else response += "0";

    // 결과를 메인 스레드로 전송
    parentPort.postMessage(response);
});