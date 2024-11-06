const file_system   = require('./fs_core');
const path_admin = "./data/admin";

module.exports = {
    data_renewal : function(){
        file_system.fileMK(path_admin,"1","token_valid.txt");
    },
    data_check : function(){
        let response = false;
        if(file_system.check(path_admin+"/renew.txt") && file_system.fileRead(path_admin,"renew.txt") == "1"){
            response = true;
        }else{response = true;}
        return response;
    },
    data_get : function(){
        let response = null;
        if(this.data_check()){
            const path_user   = "./data/user";
            const path_device = "./data/device";
            const user_list   = file_system.Dir(path_user);
            const device_list = file_system.Dir(path_device);
            const server_data = {user:{},device:{}};
            for (let index = 0; index < user_list.length; index++) {
                const user_path = path_user+"/"+user_list[index];
                if(file_system.check(user_path+"/config.csv")){
                    const user_info = file_system.fileRead(user_path,"config.csv").split(",");
                    server_data.user[user_list[index]] = {
                        date:user_info[2],
                        name:user_info[3],
                        farm:user_info[4],
                        addr:user_info[5],
                        tel :user_info[6]
                    };
                }else{
                    server_data.user[user_list[index]] = {date:null,name:null,farm:null,addr:null,tel :null};
                }
            }
            for (let index = 0; index < device_list.length; index++) {
                const device_path = path_device+"/"+device_list[index];
                const device_ip = file_system.fileRead(device_path,"ip.txt");
                if(server_data.device[device_ip] == undefined) server_data.device[device_ip] = {};
                server_data.device[device_ip][device_list[index]] = {USER:file_system.fileRead(device_path,"owner.txt")}
            }
            response = JSON.stringify(server_data);
            file_system.fileMK(path_admin,response,"data_index.json");
        }else{
            response = file_system.fileRead(path_admin,"data_index.json");
        }
        return response;
    },
}