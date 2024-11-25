const express       = require('express');
const file_system   = require('../api/fs_core');
const memory_admin  = require('../api/memory_admin');
const path_data     = require('../api/path_data');
const file_data     = require('../api/file_data');
const router        = express.Router();

router.post('/device', async function(req, res) {
    try {
        const request = req.body;
        const path_firmware = path_data.firmware();
        if(file_system.check(path_firmware + "/" + file_data.firmware())){
            file_system.fileMK(path_data.device()+"/"+request.DVC,"0",file_data.firmware_update());
            
            const version = file_system.fileRead(path_firmware,file_data.firmware()).trim();
            console.log(request,version);
            if(!file_system.check(path_data.device()+"/"+request.DVC + "/ver.txt")){
                file_system.fileMK(path_data.device()+"/"+request.DVC,request.ver,"ver.txt");
                memory_admin.data_renewal(false);
            }
            if (request.ver !== version) {
                const filepath = path_firmware + "/device_firmware.bin";
                if (file_system.check(filepath)) {
                    file_system.fileMK(path_data.device()+"/"+request.DVC,version,"ver.txt");
                    memory_admin.data_renewal(false);
                    // 파일 크기 확인
                    const fs = require('fs');
                    const stats = fs.statSync(filepath);
                    const fileSize = stats.size;
                    // Content-Length 헤더 추가
                    res.setHeader('Content-Length', fileSize);
                    res.setHeader('Connection', 'keep-alive');
                    res.setHeader('Content-Type', 'application/octet-stream');
                    // 스트림으로 파일 전송
                    const fileStream = fs.createReadStream(filepath);
                    fileStream.on('error', (error) => {
                        console.error("File stream error:", error);
                        if (!res.headersSent) {
                            res.status(500).send("File streaming failed");
                        }
                    });
                    fileStream.pipe(res);
                }else{
                    return res.status(404).send("Firmware file not found");
                }
            } else {
                return res.status(204).send("No update required");
            }
        }else{
            return res.status(404).send("Firmware file not found");
        }
    } catch (error) {
        console.error("Server error:", error);
        if (!res.headersSent) {
            res.status(500).send("Internal server error");
        }
    }
});
router.post('/device', async function(req, res) {
    try {
        const request = req.body;
        const path_firmware = path_data.firmware();
        if(file_system.check(path_firmware + "/" + file_data.firmware())){
            const version = file_system.fileRead(path_firmware,file_data.firmware()).trim();
            console.log(request,version);
            if(!file_system.check(path_data.device()+"/"+request.DVC + "/ver.txt")){
                file_system.fileMK(path_data.device()+"/"+request.DVC,request.ver,"ver.txt");
                memory_admin.data_renewal(false);
            }
            if (request.ver !== version) {
                const filepath = path_firmware + "/device_firmware.bin";
                if (file_system.check(filepath)) {
                    file_system.fileMK(path_data.device()+"/"+request.DVC,version,"ver.txt");
                    memory_admin.data_renewal(false);
                    // 파일 크기 확인
                    const fs = require('fs');
                    const stats = fs.statSync(filepath);
                    const fileSize = stats.size;
                    // Content-Length 헤더 추가
                    res.setHeader('Content-Length', fileSize);
                    res.setHeader('Connection', 'keep-alive');
                    res.setHeader('Content-Type', 'application/octet-stream');
                    // 스트림으로 파일 전송
                    const fileStream = fs.createReadStream(filepath);
                    fileStream.on('error', (error) => {
                        console.error("File stream error:", error);
                        if (!res.headersSent) {
                            res.status(500).send("File streaming failed");
                        }
                    });
                    fileStream.pipe(res);
                }else{
                    return res.status(404).send("Firmware file not found");
                }
            } else {
                return res.status(204).send("No update required");
            }
        }else{
            return res.status(404).send("Firmware file not found");
        }
    } catch (error) {
        console.error("Server error:", error);
        if (!res.headersSent) {
            res.status(500).send("Internal server error");
        }
    }
});

module.exports = router;