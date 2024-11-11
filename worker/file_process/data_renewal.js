const { parentPort } = require('worker_threads');
const memory_admin   = require('../../api/memory_admin');
const ip_collecter   = require('../../api/ip_collecter');

parentPort.on('message', async (data) => {
    let server_data = {
        user:   memory_admin.data_get_user(),
        device: memory_admin.data_get_device()
    };
    const ip_check = ip_collecter.ip_get();
    const response = JSON.stringify(server_data);
    // 결과를 메인 스레드로 전송
    parentPort.postMessage(response);
});