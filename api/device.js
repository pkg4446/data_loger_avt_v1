const file_system   = require('./fs_core');
const path_data     = require('./path_data');
const memory_admin  = require('./memory_admin');

module.exports = {
    connect : async function(user_id,device_id,device_name){
        let status_code = 400;
        const   path_user   = path_data.user()+"/"+user_id;
        const   path_device = path_data.device()+"/"+device_id;
        if(file_system.check(path_user)){
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
                        if(devices[index].split(",")[0] == device_id){
                            device_duplication = true;
                            break;
                        }
                    }
                    if(!device_duplication) file_system.fileADD(path_user,"\r\n"+device_id+","+device_name,"device.csv");
                }else{
                    file_system.fileMK(path_user,device_id+","+device_name,"device.csv");
                }
                file_system.fileMK(path_device,user_id,"owner.txt")
            }else{
                status_code = 403;
            }
        }else{
            status_code = 401;
        }
        return status_code;
    },

    disconnect : async function(user_id,device_id){
        let status_code = 200;
        const   path_user   = path_data.user()+"/"+user_id;
        const   path_device = path_data.device()+"/"+device_id;
        if(file_system.check(path_user)){
            memory_admin.data_renewal(false);
            if(file_system.check(path_device+"/owner.txt")) file_system.fileDel(path_device,"owner.txt");
            let new_list = "";
            if(file_system.check(path_user+"/device.csv")){
                const list     = file_system.fileRead(path_user,"device.csv").split("\r\n");
                let line_shift = false;
                for (let index = 0; index < list.length; index++) {
                    if(list[index].split(",")[0] != device_id){
                        if(line_shift) new_list += "\r\n";
                        else line_shift = true;
                        new_list += list[index];
                    }
                }
            }
            file_system.fileMK(path_user,new_list,"device.csv");
        }else if(file_system.check(path_device+"/owner.txt")){
            memory_admin.data_renewal(false);
            if(file_system.fileRead(path_device,"owner.txt") == user_id) file_system.fileDel(path_device,"owner.txt");
        }else{
            status_code = 401;
        }
        return status_code;
    },

    clear_null : async function(){
        let status_code = 200;
        const devices   = file_system.Dir(path_data.device());
        let device_list = false;
        devices.forEach(device => {
            const path_device = path_data.device()+"/"+device;
            if(!file_system.check(path_device+"/owner.txt")){
                device_list = true;
                file_system.folderDel(path_device);
            }
        });
        if(device_list) memory_admin.data_renewal(false);
        return status_code;
    },
}