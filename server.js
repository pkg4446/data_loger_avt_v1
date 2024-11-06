const express       = require('express');
const favicon       = require('serve-favicon');
const path          = require('path');
const file_system   = require('./api/fs_core');
const index_router  = require('./routes');
const path_user     = "./data/user";
const path_device   = "./data/device";
const path_admin    = "./data/admin";

if(!file_system.check(path_user))   file_system.folderMK(path_user);
if(!file_system.check(path_device)) file_system.folderMK(path_device);
if(!file_system.check(path_admin))  file_system.folderMK(path_admin);

const app   = express();
const port  = 3002;

app.use(express.json());
app.use(favicon(path.join(__dirname, '/public', 'favicon.ico')));
app.use('/public',express.static(__dirname +'/public'));
app.use('/', index_router);

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});