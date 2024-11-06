const worker = require("./worker");

module.exports = {
    data_renewal: async function(){
        return await worker.working("/file_process","data_renewal",null);
    },
    list_able: async function(connect_ip){
        return await worker.working("/file_process","list_able",connect_ip);
    },
}