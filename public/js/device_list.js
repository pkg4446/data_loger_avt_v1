let view_locker = false;
if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else{

    fetch_user_info();
    fetch_equipment();
}
////--------------------------------------------------------------------////
////-------------------////
function lock_shift() {
    view_locker = !view_locker;
    const view_lock = document.getElementById("view_lock");
    if(view_locker){
        view_lock.innerText = "화면 풀림";
        view_lock.style.backgroundColor = "#4ce73c";

    }else{
        view_lock.innerText = "화면 잠금";
        view_lock.style.backgroundColor = "#e74c3c";
    }
}
////-------------------////
function page_detail(devid) {
    if(view_locker){
        console.log("page_detail: "+devid);
    }
}
////-------------------////
function goal_temp_change(updown,gorl_devid) {
    if(view_locker){
        let temperature = parseInt(document.getElementById(gorl_devid).innerText);
        if(updown) temperature += 1;
        else       temperature -= 1;
        if(temperature<1)        temperature = 1;
        else if(temperature>30 ) temperature = 30;
        document.getElementById(gorl_devid).innerText = temperature
    }
}
////-------------------////
function temp_assist_change(temp_devid) {
    if(view_locker){
        const heat_state = (document.getElementById(temp_devid).innerHTML).split(": ")[1];
        let heater_flage = false;
        let heat_text    = "가온기능: ";
        if(heat_state === "OFF"){
            heater_flage = true;
            heat_text += "ON";
        }else{
            heater_flage = false;
            heat_text += "OFF";
        }
        document.getElementById(temp_devid).innerHTML = heat_text;
    }
}
////-------------------////
function getdata(send_data, device, index){
    send_data.dvid = device[0];
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
        // for (let index = 1; index < response.length-1; index++) {
        //     const device_log = response[index];
        //     console.log(device_log);
        // }
        if(response.length>2){
            const gorl_devid = "goal_"+device[0];
            const heat_devid = "heat_"+device[0];
            let HTML_scrpit = `<div class="unit-info">
                                    <div class="cell">${device[1]}</div>
                                    <div class="cell">${device[0]}</div>
                                    <div class="cell" id="${heat_devid}" onclick=temp_assist_change("${heat_devid}")>가온기능: OFF</div>
                                    <div class="cell"><span onclick=goal_temp_change(true,"${gorl_devid}")>▲목</span>표온도:<span id="${gorl_devid}">20</span><span onclick=goal_temp_change(false,"${gorl_devid}")>°C▼</span></div>
                                </div>
                                <div class="menu-row">
                                    <div class="cell header">벌통 번호</div>
                                    <div class="cell header">공기 온도</div>
                                    <div class="cell header">봉구 온도</div>
                                    <div class="cell header">봉구 습도</div>   
                                </div>
                                <div onclick=page_detail("${device[0]}")>`;
            const device_log = JSON.parse(response[response.length-2]);
            for (let index = 0; index < 5; index++) {
                HTML_scrpit += `<div class="data-row">
                                    <div class="cell">${index+1}</div>
                                    <div class="cell temp-cold">${device_log["TM"+index]}°C</div>
                                    <div class="cell temp-warm">${device_log["IC"+index]}°C</div>
                                    <div class="cell humidity">${device_log["HM"+index]}%</div>
                                </div>`;
            }
            HTML_scrpit += "</div>"
            document.getElementById("unit_"+device[0]).innerHTML = HTML_scrpit;
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    });
}
////-------------------////
function fetch_equipment() {
    // 여기에 실제 서버 URL을 입력하세요
    const today = new Date();
    const post_data = {
        date:   [today.getFullYear(),today.getMonth(),today.getDate()],
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        dvid:   null
    }
    fetch(window.location.protocol+"//"+window.location.host+"/user/list", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    })
    .then(response => {
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
            device_list.push(device);
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
////-------------------////
function fetch_user_info() {
    // 여기에 실제 서버 URL을 입력하세요
    const today = new Date();
    const post_data = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
    }
    fetch(window.location.protocol+"//"+window.location.host+"/user/info", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    })
    .then(response => {
        if (response.status==400 || response.status==406) {
            alert('로그인 정보가 없습니다.');
            window.location.href = '/web/login';
        }else if (response.status==404) {
            throw new Error('not found');
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        const user_info = data.split(",");
        console.log(user_info);
        document.getElementById('user_name').innerText = user_info[0];
        document.getElementById('farm_name').innerText = user_info[1];
        document.getElementById('farm_addr').innerText = user_info[2];
    })
    .catch(error => {
        console.log(error);
    });
}
////--------------------------------------------------------------------////