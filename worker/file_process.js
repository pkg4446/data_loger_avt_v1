const worker = require("./worker");
const pthe_process = "/file_process";

module.exports = {
    device_log: async function(request){
        return await worker.working(pthe_process,"device_log",request);
    },
    data_renewal: async function(){
        return await worker.working(pthe_process,"data_renewal",null);
    },
    list_able: async function(connect_ip){
        return await worker.working(pthe_process,"list_able",connect_ip);
    },
    hive_stat: async function(){
        return await worker.working(pthe_process,"hive_stat",null);
    },
}