const express       = require('express');
const favicon       = require('serve-favicon');
const path          = require('path');
const file_system   = require('./api/fs_core');
const index_router  = require('./routes');
const path_data     = require('./api/path_data');

if(!file_system.check(path_data.common()))   file_system.folderMK(path_data.common());
if(!file_system.check(path_data.user()))     file_system.folderMK(path_data.user());
if(!file_system.check(path_data.device()))   file_system.folderMK(path_data.device());
if(!file_system.check(path_data.admin()))    file_system.folderMK(path_data.admin());
if(!file_system.check(path_data.firmware())) file_system.folderMK(path_data.firmware());

const app   = express();
const port  = 3002;

app.use(express.json());
app.use(favicon(path.join(__dirname, '/public', 'favicon.ico')));
app.use('/public',express.static(__dirname +'/public'));
app.use('/', index_router);

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});