const file_system   = require('./fs_core');
const memory_admin  = require('./memory_admin');

module.exports = {
    ip_get : async function(){
        let response  = null;
        const path_ip = "./api/ip";
        const device_list = memory_admin.data_get_device();
        for (const ip in device_list) {
            local_check = ip.split(".")[0];
            if(local_check=='::1' || local_check=="192"){
            }else{
                if(!file_system.check(path_ip)){file_system.folderMK(path_ip);}
                let ip_list = JSON.parse(file_system.fileRead(path_ip,local_check+".json"));
                if(ip_list == null) ip_list = {};
                if(ip_list[ip] != undefined){
                }else{
                    const location = await fetch(`http://ip-api.com/json/${ip}?fields=status,region,regionName,city`);
                    const location_info = await location.json();
                    if(location_info.region == 45){location_info.code = "JB"}
                    else if(location_info.region == 26){location_info.code = "GN"}
                    ip_list[ip] = location_info;
                    file_system.fileMK(path_ip,JSON.stringify(ip_list),local_check+".json");
                }
            }
        }
        return true;
    },
}