const fs    = require('fs');

module.exports = {
    
    Dir:    function(FOLDER){
        try {
            const PATH  = FOLDER + "/";
            const dir   = fs.readdirSync(PATH);
            return dir;
        } catch (error) {    
            return false;
        }
    },

    check:  function(FOLDER){
        const PATH  = FOLDER;
        const CHECK = fs.existsSync(PATH, 'utf8')
        return CHECK;
    },
    
    move:   async function(TARGET,MOVE){
        try {
            fs.renameSync(TARGET, MOVE);
            return true;
        } catch (error) {    
            return false;
        }
    },

    folderDel:   function(FOLDER){
        const PATH  = FOLDER + "/";
        try {
            fs.rmSync(PATH, { recursive: true, force: true });
        } catch (error) {   
            console.error(`${FOLDER} 폴더가 삭제되었습니다.`);
        }
    },

    folderMK:    function(PATH){  
        const path_forder = PATH.split("/")
        let   response = false;
        if(path_forder[0]=="."){
            response = true;
            let path_make = ".";
            for (let index = 1; index < path_forder.length; index++) {
                path_make += "/"+path_forder[index];
                console.log(path_make);
                if(!fs.existsSync(path_make, 'utf8'))fs.mkdirSync(path_make);
            }
        }
        return response;
    },

    fileRead:    function(FOLDER,FILE){ 
        let response;  
        try {
            response = fs.readFileSync(`${FOLDER}/${FILE}`, 'utf8'); 
        } catch (error) {
            response = null;
        }
        return response;
    },
    
    fileMK:    function(FOLDER,DATA,FILE){        
        try {
            fs.writeFileSync(`${FOLDER}/${FILE}`, DATA);
        } catch (error) {
            return false;
        }
        return true;
    },

    fileADD:    function(FOLDER,DATA,FILE){     
        try {
            fs.appendFileSync(`${FOLDER}/${FILE}`, DATA);
        } catch (error) {
            return false;
        }
        return true;
    },

    fileDel:    function(FOLDER,FILE){
        const PATH = FOLDER + "/";
        try {
            fs.readdirSync(PATH, 'utf8');
            try {
                fs.unlinkSync(PATH+FILE);
                return FILE;
            } catch (error) {
                return false;
            }            
        } catch (error) {   
            fs.mkdirSync(PATH);
            return false;
        }                
    },

    data_csv:   async function(FOLDER,FILE,){
        try {
            const PATH = FOLDER + "/";
            const Data = fs.readFileSync(PATH + FILE, 'utf8').split("\r\n");         
            let response = "";
            response += Data[0] + "\r\n";
            let temp_data = Data[1].split(",");
            response += `${temp_data[0]},,${temp_data[1]},${temp_data[2]},${temp_data[3]},${temp_data[4]},,${temp_data[9]},${temp_data[10]},${temp_data[11]},${temp_data[12]}\r\n`;
            for (let index = 2; index < Data.length; index += 60) {
                temp_data = Data[index].split(",");
                if(index < Data.length - 60){
                    for (let index_i = index; index_i < index+60; index_i++) {
                        const temp_data_avg = Data[index].split(",");
                        temp_data[1]  = Number(temp_data[1])  + Number(temp_data_avg[1]);
                        temp_data[2]  = Number(temp_data[2])  + Number(temp_data_avg[2]);
                        temp_data[3]  = Number(temp_data[3])  + Number(temp_data_avg[3]);
                        temp_data[4]  = Number(temp_data[4])  + Number(temp_data_avg[4]);
                        
                        temp_data[9]  = Number(temp_data[9])  + Number(temp_data_avg[9]);
                        temp_data[10] = Number(temp_data[10]) + Number(temp_data_avg[10]);
                        temp_data[11] = Number(temp_data[11]) + Number(temp_data_avg[11]);
                        temp_data[12] = Number(temp_data[12]) + Number(temp_data_avg[12]);
                    }
                    temp_data[1] /= 60;
                    temp_data[2] /= 60;
                    temp_data[3] /= 60;
                    temp_data[4] /= 60;

                    temp_data[9] /= 60;
                    temp_data[10] /= 60;
                    temp_data[11] /= 60;
                    temp_data[12] /= 60;
                }
                response += `${temp_data[0]},,${temp_data[1]},${temp_data[2]},${temp_data[3]},${temp_data[4]},,${temp_data[9]},${temp_data[10]},${temp_data[11]},${temp_data[12]}\r\n`;       
            }
            return response;
        } catch (error) {    
            return false;
        }
    },
}