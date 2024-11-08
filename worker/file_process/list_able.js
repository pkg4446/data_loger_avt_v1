const { parentPort } = require('worker_threads');
const memory_admin  = require('../../api/memory_admin');

parentPort.on('message', (conn_ip) => {
    let response = "";
    const data_device = memory_admin.data_get_device()[conn_ip];
    for (const key in data_device) {
        if(data_device[key].USER == null) response += key+',';
    }
    // 결과를 메인 스레드로 전송
    parentPort.postMessage(response);
});