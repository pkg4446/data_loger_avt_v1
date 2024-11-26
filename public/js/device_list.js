let view_locker = false;
if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else{
    document.getElementById("lock_btn").innerHTML  = `<div class="btn" id="view_lock" onclick=lock_shift()>화면 잠김</div>`;
    fetch_user_info();
    fetch_equipment();
}
////--------------------------------------------------------------------////
function alert_swal(icon,title) {
    Swal.fire({
        position: "top",
        icon:   icon,
        title:  title,
        showConfirmButton: false,
        timer:  1500
    });
}
////-------------------////
function lock_shift() {
    view_locker = !view_locker;
    const view_lock = document.getElementById("view_lock");
    if(view_locker){
        view_lock.innerText = "화면 풀림";
        view_lock.style.backgroundColor = "#4ce73c";

    }else{
        view_lock.innerText = "화면 잠김";
        view_lock.style.backgroundColor = "#e74c3c";
    }
}
////-------------------////
function device_detail(devid) {
    if(view_locker){
        localStorage.setItem('device', devid);
        window.location.href = '/web/select';
    }
}
////-------------------////
function device_rename(devid) {
    if(view_locker){
        Swal.fire({
            title: "장비 이름",
            input: "text",
            showCancelButton: true,
            inputPlaceholder: "변경할 이름을 입력하세요.",
            confirmButtonText: "변경",
            cancelButtonText:  "취소"
        }).then((result) => {
            if (result.isConfirmed){
                const device_name = result.value.replaceAll(" ","");
                if(device_name === ""){
                    Swal.fire({
                        title: "이름이 없습니다.",
                        text: "이름을 입력하세요.",
                        icon: "error"
                    });
                }else{
                    fetch_device_rename(devid,device_name);
                }
            }
        });
    }
}
////-------------------////
function goal_temp_change(gorl_devid,devid,index_num,set_temp,temp_correction) {
    if(view_locker){
        let init_value = 0;
        if(index_num == 5 ) init_value = parseInt(document.getElementById(gorl_devid).innerText);
        else init_value = parseInt(document.getElementById(gorl_devid+index_num).innerText);
        Swal.fire({
            title: "가온 목표온도",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "설정",
            cancelButtonText:  "취소",
            input: "range",
            inputLabel: "목표온도",
            inputAttributes: {
                min: "1",
                max: "30",
                step: "1"
        },
            inputValue: init_value
        }).then((result) => {
            if (result.isConfirmed){
                const value_number = 5;
                let temperature = [];
                const set_value = parseInt(result.value) + temp_correction;
                if(index_num == value_number){
                    for (let index = 0; index < value_number; index++) {
                        temperature.push(parseInt(set_value));
                        document.getElementById(gorl_devid+index).innerText = set_value-temp_correction;
                    }
                }else{
                    for (let index = 0; index < value_number; index++) {
                        if(index_num == index){
                            temperature.push(parseInt(set_value));
                            document.getElementById(gorl_devid+index).innerText = set_value-temp_correction;
                        }else temperature.push(parseInt(document.getElementById(gorl_devid+index).innerText))
                    }
                }
                let temperature_avg = 0;
                for (let index = 0; index < value_number; index++) {
                    temperature_avg += temperature[index];
                }
                temperature_avg = temperature_avg/value_number;

                fetch_equipment_heater(devid,true,temperature);
                document.getElementById(gorl_devid).innerText = temperature_avg-temp_correction;
            }
        });        
    }else if(devid!=5 && set_temp!=null){
        alert_swal("info",`현재값: ${set_temp[devid]}`);
    }
}
////-------------------////
function temp_assist_change(temp_devid,devid) {
    if(view_locker){
        const heat_text = "가온 기능: ";
        Swal.fire({
            title: "가온 기능",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "사용",
            cancelButtonText:  "정지"
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById(temp_devid).innerHTML = heat_text+"ON";
                fetch_equipment_heater(devid,false,1);
                Swal.fire({
                    title: "ON",
                    text: "가온 기능을 사용합니다.",
                    icon: "success"
                });
                } else if(result.dismiss === "cancel"){
                document.getElementById(temp_devid).innerHTML = heat_text+"OFF";
                fetch_equipment_heater(devid,false,0);
                Swal.fire({
                    title: "OFF",
                    text: "가온 기능을 정지합니다.",
                    icon: "error"
                });
            }
        });
    }
}
////-------------------////
function getdata(send_data, device){
    const hive_num = 5;
    send_data.dvid = device[0];
    fetch(window.location.protocol+"//"+window.location.host+"/hive/config", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(send_data)
    })
    .then(response => {
        if (response.status==400 || response.status==401) {
            alert_swal("error",'로그인 정보가 없습니다.');
        }else if (response.status==403) {
            alert_swal("error",'등록되지 않은 장비입니다.');
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        const response = data.split("\r\n");
        const gorl_devid = "goal_"+device[0];
        const heat_devid = "heat_"+device[0];

        let HTML_script_first   = "";
        let HTML_script_second  = `<div class="unit-info">
                                <div class="cell" id="${device[0]}" onclick=device_rename("${device[0]}")>${device[1]}</div>
                                <div class="cell">${device[0]}</div>`;
        if(response[0]!="null"){
            const device_log    = JSON.parse(response[0]);
            const device_config = JSON.parse(response[1]);

            // console.log(device_log);
            // console.log(device_config);

            const temp_correction = 0;

            const bar_number = 5;
            const today = new Date();
            today.setHours(today.getHours()-1);
            const data_date = new Date(device_log.date);

            HTML_script_second+= `<div class="cell" id="${heat_devid}" onclick=temp_assist_change("${heat_devid}","${device[0]}") `;
            if(device_config.dv != null && device_config.dv[device_config.dv.length-1] === device_config.ab) HTML_script_second+= 'style="background-color:Chartreuse;"'
            else HTML_script_second+= 'style="background-color:Yellow;"'

            if(device_config.ab === '1'){
                HTML_script_second+= ">가온 기능: ON</div>";

                HTML_script_first= `<div class="menu-row"><div class="cell">가온 현황</div><div class="cell">${device[1]}</div></div><div class="data-row">`;
                for (let index = 0; index < hive_num; index++) {
                    const bar_percent = Math.round(device_log.WK[index]/device_log.GAP*100);
                    const bar_ratio   = (100/bar_number).toFixed(2);
                    const bar_fill    = (bar_percent/bar_ratio).toFixed(2);
                    HTML_script_first+= `<div class="progress-box"><div class="cell"><div class="progress-bars">`;
                    for (let index_bar = 0; index_bar < bar_number; index_bar++) {
                        if(index_bar>=bar_number-bar_fill){
                            HTML_script_first+= `<div class="bar"><div class="bar-fill" style="width:100%"></div></div>`;
                        }else{
                            if(bar_number-bar_fill-index_bar-1 < 0){
                                HTML_script_first+= `<div class="bar"><div class="bar-fill" style="width:${Math.round((bar_fill-Math.floor(bar_fill))*100)}%"></div></div>`;
                            }else{HTML_script_first+= `<div class="bar"><div class="bar-fill"></div></div>`;}
                        }
                    }
                    HTML_script_first+= `</div></div><div class="progress-title">출력: <span id="percentage">${bar_percent/2}</span>W</div></div>`
                }
                HTML_script_first+= "</div>";
                document.getElementById("unit_first_"+device[0]).innerHTML  = HTML_script_first;
            }else{
                HTML_script_second+= ">가온 기능: OFF</div>";
                document.getElementById("unit_first_"+device[0]).style.display = "none";
            }

            let average_value   = 0;
            if( device_config.th != null){
                for (let index = 0; index < hive_num; index++) {
                    average_value += parseInt(device_config.th[index]);
                }
            }else{
                device_config.th = [0,0,0,0,0];
            }

            let average_value_check = 0;
            if( device_config.dv != null){
                for (let index = 0; index < device_config.dv.length-1; index++) {
                    average_value_check += parseInt(device_config.dv[index]);
                }
            }

            HTML_script_second+= `<div class="cell" onclick=goal_temp_change("${gorl_devid}","${device[0]}",5,null,${temp_correction}) `;
            if(average_value === average_value_check){
                HTML_script_second+= 'style="background-color:Chartreuse;"'
            }else{
                HTML_script_second+= 'style="background-color:Yellow;"';
            }
            HTML_script_second+= `>가온 평균:<span id="${gorl_devid}">${(average_value/hive_num)-temp_correction}</span>°C</div></div>`;
            if(today>data_date){
                HTML_script_second+= `<div class="menu-row">
                                    <div class="cell warning" onclick=fetch_equipment_disconnect('${device[0]}')>장비 삭제</div>
                                    <div class="cell warning">마지막 기록 : ${data_date.getFullYear()}년 ${data_date.getMonth()}월 ${data_date.getDate()}일 ${data_date.getHours()}시 ${data_date.getMinutes()}분</div>
                                </div>`;
            }
            HTML_script_second+= `<div class="data-row">
                                <div class="cell header">벌통 번호</div>
                                <div class="cell header">공간 온도</div>
                                <div class="cell header">봉구 온도</div>
                                <div class="cell header">봉구 습도</div>
                                <div class="cell header">가온</div>
                                </div><div>`;
            for (let index = 0; index < hive_num; index++) {
                HTML_script_second+= `<div class="data-row">
                                    <div class="cell"           onclick=device_detail("${device[0]}")>${index+1}</div>
                                    <div class="cell temp-air"  onclick=device_detail("${device[0]}")>${device_log["TM"][index]-temp_correction}°C</div>
                                    <div class="cell temp-warm" onclick=device_detail("${device[0]}")>${device_log["IC"][index]}°C</div>
                                    <div class="cell humidity"  onclick=device_detail("${device[0]}")>${device_log["HM"][index]}%</div>
                                    <div class="cell header" onclick=goal_temp_change("${gorl_devid}","${device[0]}",${index},${device_config.dv},${temp_correction})><span id="${gorl_devid+index}">${device_config.th[index]-temp_correction}</span>°C</div>
                                </div>`;
            }
        }else{
            HTML_script_second+= `    <div class="cell" id="${heat_devid}" onclick=temp_assist_change("${heat_devid}","${device[0]}")>가온 기능: OFF</div>
                                <div class="cell" onclick=goal_temp_change("${gorl_devid}","${device[0]}",5,null,${temp_correction})>목표:<span id="${gorl_devid}">0</span>°C</div>
                            </div>
                            <div class="menu-row">
                                <div class="cell warning" onclick=fetch_equipment_disconnect('${device[0]}')>장비 삭제</div>
                                <div class="cell warning">데이터가 없음</div>
                            </div>`;
        }
        HTML_script_second+= "</div>"
        document.getElementById("unit_second_"+device[0]).innerHTML = HTML_script_second;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
////-------------------////
function list_shift(device_list,swap_a,swap_b) {
    if(view_locker){
        let devices = [];
        if(swap_a != null && swap_b != null){
            for (let index = 0; index < device_list.length; index++) {
                if(index == swap_a){devices.push(device_list[swap_b]);}
                else if(index == swap_b){devices.push(device_list[swap_a]);}
                else{devices.push(device_list[index]);}
            }
        }else{
            devices = device_list;
        }
        let HTML_script_second = "<br>";
        for (let index = 0; index < devices.length; index++) {
            const device = devices[index].split(",");
            HTML_script_second += `<div class="unit-info">
                    <div class="cell" id="${device[0]}">${device[1]}</div>
                    <div class="cell">${device[0]}</div>`
            if(index == 0)  HTML_script_second += `<div class="cell">위로</div>`
            else            HTML_script_second += `<div class="cell" onclick=list_shift(${JSON.stringify(devices)},${index},${index-1})>위로</div>`
            
            if(index == devices.length-1) HTML_script_second += `<div class="cell">아래로</div>`
            else                          HTML_script_second += `<div class="cell" onclick=list_shift(${JSON.stringify(devices)},${index},${index+1})>아래로</div>`
            HTML_script_second += "</div>";
        }
        HTML_script_second += `<div class="btn" style="background-color:#4ce73c;" onclick=fetch_list_change(${JSON.stringify(devices)})>확인</div>`;
        
        document.getElementById('farm_section_second').innerHTML = HTML_script_second;
    }
}
////-------------------////
function fetch_list_change(device_list) {
    const post_data = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        list:   device_list
    }
    fetch(window.location.protocol+"//"+window.location.host+"/hive/list_arrange", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    })
    .then(response => {
        if (response.status==400 || response.status==406) {
            alert_swal("error",'로그인 정보가 없습니다.');
            window.location.href = '/web/login';
        }else{
            alert_swal("info",'벌통을 정렬 했습니다.');
            fetch_equipment();
        }
        return; // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .catch(error => {
        console.log(error);
    });
}
////-------------------////
function fetch_equipment() {
    // 여기에 실제 서버 URL을 입력하세요
    const today = new Date();
    const post_data = {
        date:   [today.getFullYear(),today.getMonth(),today.getDate()],
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    }
    fetch(window.location.protocol+"//"+window.location.host+"/hive/list", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    })
    .then(response => {
        if (response.status==400 || response.status==401) {
            alert_swal("error",'로그인 정보가 없습니다.');
            window.location.href = '/web/login';
        }else if (response.status==403) {
            alert_swal("error",'등록된 장비가 없습니다.');
            window.location.href = '/web/connect';
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        const devices = data.split("\r\n");
        let device_list = [];
        let HTML_script_first = "";
        let HTML_script_second= "<br>";
        for (let index = 0; index < devices.length; index++) {
            const device = devices[index].split(",");
            device_list.push(device);
            HTML_script_first += `<div class="unit-section" id="unit_first_${device[0]}"></div>`;
            HTML_script_second+= `<div class="unit-section" id="unit_second_${device[0]}"></div>`;
        }
        HTML_script_second += `<div class="btn" onclick=list_shift(${JSON.stringify(devices)},${null},${null})>벌통 정렬</div>`;
        document.getElementById('farm_section_first').innerHTML  = HTML_script_first;
        document.getElementById('farm_section_second').innerHTML = HTML_script_second;
        for (let index = 0; index < device_list.length; index++) {
            getdata(post_data,device_list[index]);
        }
    })
    .catch(error => {
        console.log(error);
    });
}
////-------------------////
function fetch_user_info() {
    // 여기에 실제 서버 URL을 입력하세요
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
            alert_swal("error",'로그인 정보가 없습니다.');
            window.location.href = '/web/login';
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        const user_info = data.split(",");
        document.getElementById('user_name').innerText = user_info[0];
        document.getElementById('farm_name').innerText = user_info[1];
        document.getElementById('farm_addr').innerText = user_info[2];
    })
    .catch(error => {
        console.log(error);
    });
}
////-------------------////
function fetch_equipment_disconnect(device_id) {
    if(view_locker){
        Swal.fire({
            title: "장비 연결",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText:  "취소"
        }).then((result) => {
            if (result.isConfirmed){
                const post_data = {
                    id:     localStorage.getItem('user'),
                    token:  localStorage.getItem('token'),
                    dvid:   device_id
                }
                fetch(window.location.protocol+"//"+window.location.host+"/hive/disconnect", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(post_data)
                })
                .then(response => {
                    if (response.status==400 || response.status==401) {
                        alert_swal("error",'로그인 정보가 없습니다.');
                        window.location.href = '/web/login';
                    }else if (response.status==403) {
                        alert_swal("warning","등록된 장비가 없습니다.");
                    }else if (response.status==200) {
                        document.getElementById(`unit_second_${device_id}`).innerHTML="";
                        alert_swal("success","장비등록을 해제했습니다.");                        
                    }
                })
                .catch(error => {
                    console.log(error);
                });
            }
        });
    }
}
////-------------------////
function fetch_device_rename(device_id,device_name) {
    if(view_locker){
        const post_data = {
            id:     localStorage.getItem('user'),
            token:  localStorage.getItem('token'),
            dvid:   device_id,
            name:   device_name
        }
        fetch(window.location.protocol+"//"+window.location.host+"/hive/devicerename", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post_data)
        })
        .then(response => {
            if (response.status==400 || response.status==401) {
                alert_swal("error",'로그인 정보가 없습니다.');
                window.location.href = '/web/login';
            }else if (response.status==403) {
                alert_swal("warning","등록된 장비가 없습니다.");
            }else if (response.status==200) {
                document.getElementById(`${device_id}`).innerText = device_name;
                alert_swal("success","장비 이름을 변경했습니다.");
            }
        })
        .catch(error => {
            console.log(error);
        });
    }
}
////-------------------////
function fetch_equipment_heater(device_id,func,value) {
    // 여기에 실제 서버 URL을 입력하세요
    const post_data = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token'),
        dvid:   device_id,
        func:   func,
        value:  value
    }
    fetch(window.location.protocol+"//"+window.location.host+"/hive/heater", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    })
    .then(response => {
        if (response.status==400 || response.status==401) {
            alert_swal("error",'로그인 정보가 없습니다.');
            window.location.href = '/web/login';
        }else if (response.status==403) {
            alert_swal("warning","등록된 장비가 없습니다.");
        }else if (response.status==200) {
            alert_swal("success","설정이 적용 되었습니다.");
        }
    })
    .catch(error => {
        console.log(error);
    });
}
////--------------------------------------------------------------------////