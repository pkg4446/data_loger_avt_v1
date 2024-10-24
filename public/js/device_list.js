if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else{
    fetchEquipment();
}

const today = new Date();
const post_data = {
    date:   [today.getFullYear(),today.getMonth(),today.getDate()],
    id:     localStorage.getItem('user'),
    token:  localStorage.getItem('token'),
    dvid:   null
}
////--------------------------------------------------------------------////

////-------------------////
function getdata(send_data, device, index){
    send_data.dvid = device;
    fetch(window.location.protocol+"//"+window.location.host+"/user/log", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(send_data)
    })
    .then(response => {
        response.status
        if (response.status==400) {
            throw new Error('정보가 누락됐습니다.');
        }else if (response.status==401) {
            throw new Error('로그인 정보가 없습니다.');
        }else if (response.status==403) {
            throw new Error('등록되지 않은 장비입니다.');
        }else if (response.status==409) {
            throw new Error('이미 등록된 장비입니다.');
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        const response = data.split("\r\n");
        console.log(device);
        // for (let index = 1; index < response.length-1; index++) {
        //     const device_log = response[index];
        //     console.log(device_log);
        // }
        if(response.length>2){
            let HTML_scrpit = `<div class="unit-info">
                                    <div class="cell">유닛 ${index}</div>
                                    <div class="cell">${device}</div>
                                </div>`;
            const device_log = JSON.parse(response[response.length-2]);
            for (let index = 0; index < 5; index++) {
                HTML_scrpit += `<div class="data-row">
                                    <div class="cell">벌통 ${index+1}</div>
                                    <div class="cell temp-cold">${device_log["TM"+index]}°C</div>
                                    <div class="cell temp-warm">${device_log["IC"+index]}°C</div>
                                    <div class="cell humidity">${device_log["HM"+index]}%</div>
                                    <div class="cell status-on">ON</div>
                                    <div class="cell">개별설정</div>
                                </div>`;
            }
            console.log(device_log);
            document.getElementById("unit_"+device  ).innerHTML = HTML_scrpit;
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    });
}
////-------------------////
function fetchEquipment() {
    // 여기에 실제 서버 URL을 입력하세요
    const userid    = localStorage.getItem('user');
    const token     = localStorage.getItem('token');
    fetch(window.location.protocol+"//"+window.location.host+"/user/list", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id:     userid,
            token:  token
        })
    })
    .then(response => {
        response.status
        if (response.status==400 || response.status==401) {
            alert('로그인 정보가 없습니다.');
            window.location.href = '/web/login';
        }else if (response.status==403) {
            alert('등록된 장비가 없습니다.');
            window.location.href = '/web/connect';
        }else if (response.status==404) {
            throw new Error('not found');
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        const devices = data.split("\r\n");
        let device_list = [];
        let HTML_scrpit = "";
        for (let index = 0; index < devices.length-1; index++) {
            const device = devices[index].split(",");
            device_list.push(device[0]);
            HTML_scrpit += `<div class="unit-section" id="unit_${device[0]}"></div>`;
        }
        document.getElementById('farm_section').innerHTML = HTML_scrpit;
        for (let index = 0; index < device_list.length; index++) {
            getdata(post_data,device_list[index],index);
        }
    })
    .catch(error => {
        console.log(error);
    });
}
////--------------------------------------------------------------------////