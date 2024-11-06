const file_system = require('./fs_core');
const file_worker = require('../worker/file_process');
const path_admin  = "./data/admin";

module.exports = {
    data_renewal : function(){
        file_system.fileMK(path_admin,"1","renew.txt");
    },
    data_check : function(){
        let response = false;
        if(file_system.check(path_admin+"/renew.txt") && file_system.check(path_admin+"/data_index.json")){
            if(file_system.fileRead(path_admin,"renew.txt") == "1") response = true;
        }else{response = true;}
        return response;
    },
    data_get : async function(){
        let response = null;
        if(this.data_check()){
            response = await file_worker.data_renewal();
        }else{
            response = file_system.fileRead(path_admin,"data_index.json");
        }
        return response;
    },
}