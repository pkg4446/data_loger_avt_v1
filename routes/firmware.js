const express       = require('express');
const fs            = require('fs');
const file_system   = require('../api/fs_core');
const router        = express.Router();

router.post('/device', async function(req, res) {
    try {
        const request = req.body;
        const path_firmware = "./data/path_firmware";
        const version = fs.readFileSync(path_firmware + "/device_version.txt", 'utf8').trim();
        
        console.log("Received version:", request.ver);
        console.log("Current version:", version);

        if (request.ver !== version) {
            const filepath = path_firmware + "/device_firmware.bin";
            
            if (fs.existsSync(filepath)) {
                // 파일 크기 확인
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
    } catch (error) {
        console.error("Server error:", error);
        if (!res.headersSent) {
            res.status(500).send("Internal server error");
        }
    }
});

module.exports = router;