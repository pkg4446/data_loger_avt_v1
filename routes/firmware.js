const express       = require('express');
const file_system   = require('../api/fs_core');
const router        = express.Router();

router.post('/device', async function(req, res) {
    const request = req.body;
    const path_firmware = "./data/path_firmware";
    const version = file_system.fileRead(path_firmware,"device_version.txt");
    if(request.ver == version){
        const filename = "device_firmware";
        const filepath = path_firmware + "/device_firmware.bin";
        console.log(filepath);
        res.status(200).download(filepath, filename, (err) => {
            if (err){
                res.status(204).send("err");
            }else {
                res.end();
            }
        });
    }else{
        res.status(204).send("null");
    }
});

module.exports = router;