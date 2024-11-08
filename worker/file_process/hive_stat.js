const { parentPort } = require('worker_threads');
const file_system   = require("../../api/fs_core");

parentPort.on('message', () => {
    const date_now  = new Date();
    let response    = {date:date_now};
    let path_common = "./data/common/"+date_now.getFullYear();

    if(date_now.getMonth()<10) path_common += "0";
    path_common += date_now.getMonth();
    if(!file_system.check(path_common)){file_system.folderMK(path_common);}

    let filename = "";
    if(date_now.getDate()<10) filename += "0";
    filename += date_now.getDate();   

    const path_hive = "./data/device";
    const path_user = "./data/user";
    const list_user = file_system.Dir(path_user);

    const valid_date = date_now.setHours(new Date().getHours()-1)
    
    for (let index = 0; index < list_user.length; index++) {
        const user = path_user+"/"+list_user[index];
        if(file_system.check(user+"/location.txt")){
            const location = file_system.fileRead(user,"location.txt");
            if(response[location] == undefined) response[location] = {
                farm: 0,
                HM:[0,0,0,0,0],IC:[0,0,0,0,0],TM:[0,0,0,0,0],WK:[0,0,0,0,0],
                HM_count:[0,0,0,0,0],IC_count:[0,0,0,0,0],TM_count:[0,0,0,0,0],
            };
            if(file_system.check(user+"/device.csv")){
                response[location].farm += 1;
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
                                            response[location][key][_data] += parseFloat(element);
                                            if(key != "WK") response[location][`${key}_count`][_data] += 1;
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
    response = JSON.stringify(response);
    console.log(path_common,response,filename+".json");

    if(file_system.check(path_common+"/"+filename+".json")){
        file_system.fileADD(path_common,"\r\n"+response,filename+".json");
    }else{
        file_system.fileMK(path_common,response,filename+".json");
    }
    
    console.log(response);

    // 결과를 메인 스레드로 전송
    parentPort.postMessage(response);
});