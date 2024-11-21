const { parentPort } = require('worker_threads');
const file_system   = require("../../api/fs_core");
const path_data      = require("../../api/path_data");

parentPort.on('message', async () => {
    const date_now  = new Date();
    const valid_date = new Date(date_now.getFullYear(),date_now.getMonth(),date_now.getDate(),date_now.getHours()-1,date_now.getMinutes(),date_now.getSeconds());
    
    let response    = "";
    let new_date    = {date:date_now};
    let path_common = path_data.common()+"/"+date_now.getFullYear()+"/";

    if(date_now.getMonth()<10) path_common += "0";
    path_common += date_now.getMonth();
    if(!file_system.check(path_common)){file_system.folderMK(path_common);}

    let filename = "";
    if(date_now.getDate()<10) filename += "0";
    filename += date_now.getDate();

    const file_falge = file_system.check(path_common+"/"+filename+".json");
    let   file_update = false;
    if(file_falge){
        const path_device_change = path_data.common();
        if(file_system.fileRead(path_device_change,"renew_data.txt")=="1"){
            file_system.fileMK(path_device_change,"0","renew_data.txt");
            file_update = true;
        }else{
            const data_array = file_system.fileRead(path_common,filename+".json").split("\r\n");
            const last_data  = new Date(JSON.parse(data_array[data_array.length-1]).date);
            if(valid_date > last_data){
                file_update = true;
            }else{
                response = data_array[data_array.length-1];
            }
        }
    }else{
        file_update = true;
    }

    if(file_update){
        const path_hive = path_data.device();
        const path_user = path_data.user();
        const list_user = file_system.Dir(path_user);
        
        for (let index = 0; index < list_user.length; index++) {
            const user = path_user+"/"+list_user[index];
            if(file_system.check(user+"/location.txt")){
                const location = file_system.fileRead(user,"location.txt");
                if(new_date[location] == undefined) new_date[location] = {
                    farm: 0,
                    HM:0,IC:0,TM:0,WK:0,
                    HM_count:0,IC_count:0,TM_count:0,
                };
                if(file_system.check(user+"/device.csv")){
                    new_date[location].farm += 1;
                    const user_hive = file_system.fileRead(user,"device.csv").split("\r\n");
                    for (let _hive = 0; _hive < user_hive.length; _hive++) {
                        const hive = path_hive + "/" + user_hive[_hive].split(",")[0];
                        if(file_system.check(hive+"/lastest.json")){
                            const hive_data = JSON.parse(file_system.fileRead(hive,"lastest.json"));
                            let data_time = new Date(hive_data.date);
                            if(valid_date < data_time){
                                for (const key in hive_data) {
                                    if(key == "HM" || key == "IC" || key == "TM" || key == "WK"){
                                        for (let _data = 0; _data < hive_data[key].length; _data++) {
                                            const element = hive_data[key][_data];
                                            if(element != "nan") {
                                                new_date[location][key] += parseFloat(element);
                                                if(key != "WK") new_date[location][`${key}_count`] += 1;
                                            }else{}
                                        }
                                    }else{}
                                }
                            }
                        }else{}
                    }
                }else{}
            }else{}
        }
        new_date = JSON.stringify(new_date);
        if(file_falge){
            file_system.fileADD(path_common,"\r\n"+new_date,filename+".json");
        }else{
            file_system.fileMK(path_common,new_date,filename+".json");
        }
        response = new_date;
    }else{}
    // 결과를 메인 스레드로 전송
    parentPort.postMessage(response);
});