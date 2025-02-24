const admin_page = {
    user:      null,
    device:    null
};
document.getElementById("lock_btn").innerHTML  = `<div class="btn" id="view_lock" onclick=admin_logout()>MOD OFF</div>`;
admin_check();
function admin_logout() {
    localStorage.removeItem('manager');
    Swal.fire({
        position: "top",
        icon:   "info",
        title:  '관리자 로그아웃',
        text:   '관리자 계정이 로그아웃 되었습니다.',
        showConfirmButton: false,
        timer:  1500
    }).then(() => {
        window.location.href = '/';
    });
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
function user_login(user_id) {
    if(user_id == localStorage.getItem('user')){
        alert_swal("info",user_id + "계정으로 로그인 중입니다.");
    }else{
        Swal.fire({
            position: "top",
            icon:   "question",
            title:  user_id+" 계정으로 로그인",
            showCancelButton: true,
            confirmButtonText: "확인",
            cancelButtonText:  "취소"
        }).then((result)=>{
            if(result.isConfirmed){
                fetch(window.location.protocol+"//"+window.location.host+"/admin/superuser", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token:  localStorage.getItem('manager'),
                        userid: user_id
                    })
                }).then(response => {
                    if (response.status==400) {
                        throw new Error('관리자 TOKEN이 누락됐습니다.');
                    }else if (response.status==403) {
                        throw new Error('TOKEN이 유효하지 않습니다.');
                    }
                    return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
                })
                .then(data => {
                    if (data != "fail") {
                        localStorage.setItem('user', user_id);
                        localStorage.setItem('token', data);
                        Swal.fire({
                            position: "top",
                            icon:   "success",
                            title:  user_id + "계정으로 로그인 되었습니다.",
                            showConfirmButton: false,
                            timer:  1500
                        });
                    } else {}
                })
                .catch((error) => {
                    console.error('Error:', error);
                    Swal.fire({
                        position: "top",
                        icon:   "error",
                        title:  '관리자 접속 오류가 발생했습니다.',
                        text:   error,
                        showConfirmButton: false,
                        timer:  1500
                    }).then(() => {
                        admin_authority();
                    });
                });
            }
        });
    }
}
////-------------------////
function admin_login() {
    Swal.fire({
        position: "top",
        icon:   "info",
        title:  '세션이 유효하지 않습니다.',
        text:   '관리자가 새로 접속하였거나, 토큰이 만료되었습니다.',
        showConfirmButton: false,
        timer:  1500
    }).then(() => {
        admin_check();
    });
}
////-------------------////
function admin_check() {
    fetch(window.location.protocol+"//"+window.location.host+"/admin/check", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({token:localStorage.getItem('manager')})
    })
    .then(res => {
        if (res.status==400) {
            admin_authority();
        }else{
            data_list();
        }
    });
}
////-------------------////
function admin_authority() {
    Swal.fire({
        position: "top",
        icon:   "question",
        title:  "관리자 로그인",
        input: "text",
        inputPlaceholder: "관리자 KEY를 입력하세요."
    }).then((result)=>{
        if(result.value != "" && result.value != undefined){
            fetch(window.location.protocol+"//"+window.location.host+"/admin/authority", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({key:result.value})
            }).then(response => {
                if (response.status==400) {
                    throw new Error('관리자 KEY가 누락됐습니다.');
                }else if (response.status==403) {
                    throw new Error('KEY가 다릅니다.');
                }else if (response.status==202) {
                    throw new Error("관리자 KEY가 변경되었습니다.");
                }
                return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
            })
            .then(data => {
                if (data != "key" && data != "fail" && data != "new") {
                    localStorage.setItem('manager', data);
                    Swal.fire({
                        position: "top",
                        icon:   "success",
                        title:  "관리자로 접속 되었습니다.",
                        showConfirmButton: false,
                        timer:  1500
                    });
                    data_list();
                } else {}
            })
            .catch((error) => {
                console.error('Error:', error);
                Swal.fire({
                    position: "top",
                    icon:   "error",
                    title:  '관리자 접속 오류가 발생했습니다.',
                    text:   error,
                    showConfirmButton: false,
                    timer:  1500
                }).then(() => {
                    admin_authority();
                });
            });
        }else{
            admin_authority();
        }
    });
}
////-------------------////
function user_list_view(user_list) {
    let HTML_scrpit = `<table class="data-table"><thead><tr>
    <th>ID</th><th>이름</th><th>농장</th><th>주소</th><th>전화</th><th>가입날짜</th>
    </tr></thead><tbody>`;
    for (const user_id in user_list) {
        const user_info = user_list[user_id];
        const user_date = new Date(user_info.date);
        HTML_scrpit += `<tr onclick=user_login("${user_id}") style="cursor:pointer;">
            <td>${user_id}</td>
            <td>${user_info.name}</td>
            <td>${user_info.farm}</td>
            <td>${user_info.addr}</td>
            <td>${user_info.tel}</td>
            <td>${user_date.toISOString().substring(0, 10)}</td>
        </tr>`;
    }
    HTML_scrpit += "</tbody></table>"
    document.getElementById("user_table").innerHTML = HTML_scrpit;
}
function device_list_view(device_list) {
    // console.log(device_list);
    let HTML_scrpit = `<table class="data-table"><thead><tr>
    <th>IP</th><th>ID</th><th>firmware</th><th>등록 유저</th></tr></thead><tbody>`;
    for (const device_ip in device_list) {
        if(device_ip != "ver"){
            let ip_once = true;
            for (const device_id in device_list[device_ip]) {
                let version = device_list[device_ip][device_id].VER;
                let version_update = true;
                let user_id = device_list[device_ip][device_id].USER;
                if(version == null){version = "?.?.?";}
                else if(version == device_list.ver){
                    version_update = false;
                    version = "latest ver";
                }
                HTML_scrpit += "<tr>"
                if(ip_once){
                    ip_once = false;
                    HTML_scrpit += `<td>${device_ip}</td>`;
                }else{
                    HTML_scrpit += `<td></td>`;
                }
                HTML_scrpit += `<td>${device_id}</td><td`;
                if(version_update){HTML_scrpit += ` onclick=firmware_update("${device_id}") style="cursor:pointer;"`;}
                HTML_scrpit += `>${version}</td>`;
                if(user_id == null){HTML_scrpit  += `<td onclick=device_regist("${device_ip}","${device_id}")`;}
                else{HTML_scrpit += `<td onclick=device_del("${device_ip}","${device_id}","${user_id}")`;}
                HTML_scrpit += ` style="cursor:pointer;">${user_id}</td></tr>`;
            }
        }
    }
    HTML_scrpit += "</tbody></table>"
    document.getElementById("device_table").innerHTML = HTML_scrpit;
}
////-------------------////
function device_regist(devip,devid) {
    Swal.fire({
        title: "사용자 계정",
        input: "text",
        showCancelButton: true,
        inputPlaceholder: "장비를 연결할 사용자 ID를 입력하세요",
        confirmButtonText: "변경",
        cancelButtonText:  "취소"
    }).then((result) => {
        if (result.isConfirmed){
            const user_id = result.value.replaceAll(" ","");
            if(user_id === ""){
                Swal.fire({
                    title: "사용자 ID가 없습니다.",
                    text: "사용자 ID를 입력하세요.",
                    icon: "error"
                });
            }else{
                fetch_device_change("connect",devip,devid,user_id);
            }
        }
    });
}
////-------------------////
function fetch_device_change(api,device_ip,device_id,user_id) {
    const post_data = {
        token:localStorage.getItem('manager'),
        dvid:   device_id,
        user:   user_id
    }
    fetch(window.location.protocol+"//"+window.location.host+"/admin/"+api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    })
    .then(response => {
        if (response.status==400) {
            throw new Error("정보 누락");
        }else if (response.status==401) {
            throw new Error("등록된 유저가 없습니다.");
        }else if (response.status==403) {
            throw new Error("등록된 장비가 없습니다.");
        }else if (response.status==406) {
            admin_login();
        }else if (response.status==409) {
            throw new Error('이미 등록된 장비입니다.');
        }else if (response.status==200) {
            if(api == "connect"){alert_swal("success","장비를 계정에 연결했습니다.");}
            else if(api == "disconnect"){
                user_id = null;
                alert_swal("info","장비연결을 해지했습니다.");
            }
            if(api != "firmware"){
                admin_page.device[device_ip][device_id].USER = user_id;
                device_list_view(admin_page.device);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert_swal("error",error);
    });
}
////-------------------////
function ascii() {
    const type = Math.floor(Math.random()*3);
    let ascii_dec = 0;
    if(type == 0){
        ascii_dec = Math.floor(Math.random()*10)+48;
    }else{
        ascii_dec = Math.floor(Math.random()*26);
        if(type == 1) ascii_dec += 65;
        else ascii_dec += 97;
    }
    return String.fromCharCode(ascii_dec);
}
////-------------------////
async function secret_code(title) {
    let del_code = "";
    for (let index = 0; index < 4; index++) {
        del_code += ascii();
    }
    const input = await Swal.fire({
        title: title,
        input: "text",
        text: del_code + "를 입력하세요.",
        showCancelButton: true,
        inputPlaceholder: del_code,
        confirmButtonText: "변경",
        cancelButtonText:  "취소"
    })
    console.log(del_code,input.value);
    return del_code == input.value;
}
////-------------------////
function device_del(devip,devid,userid) {
    secret_code("연결 해제").then((result) => {
        if(result){
            fetch_device_change("disconnect",devip,devid,userid);
        }else{
            Swal.fire({
                title: "코드가 틀렸습니다.",
                icon:  "error"
            });
        }
    })
}
////-------------------////
function firmware_update(devid) {
    secret_code("Firmware update").then((result) => {
        if(result){
            fetch_device_change("firmware",null,devid,null);
        }else{
            Swal.fire({
                title: "코드가 틀렸습니다.",
                icon:  "error"
            });
        }
    })
}
////-------------------////
function data_list() {
    if(admin_page.user == null){
        fetch(window.location.protocol+"//"+window.location.host+"/admin/list_data", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({token:localStorage.getItem('manager')})
        }).then(response => {
            if (response.status==400) {
                throw new Error('다른곳에서 관리자가 로그인 했습니다.');
            }else if (response.status==403) {
                admin_login();
            }
            return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
        })
        .then(data => {
            if (data != "token") {
                const res_data = JSON.parse(data);
                admin_page.user   = res_data.user;
                admin_page.device = res_data.device;
                user_list_view(res_data.user);
                device_list_view(res_data.device);
            } else {
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert_swal("error",error);
        });
    }else{
        user_list_view(admin_page.user);
        device_list_view(admin_page.device);
    }
}
////-------------------////
function del_null() {
    secret_code("장치 정리").then((result) => {
        if(result){
            fetch(window.location.protocol+"//"+window.location.host+"/admin/clear", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({token:localStorage.getItem('manager')})
            })
            .then(res => {
                if (res.status==400) {
                    admin_authority();
                }else{
                    Swal.fire({
                        position: "top",
                        icon:   "info",
                        title:  '장치 정리',
                        text:   'null 장치를 제거했습니다',
                        showConfirmButton: false,
                        timer:  1500
                    }).then(() => {
                        location.reload();
                    });
                }
            });
        }else{
            Swal.fire({
                title: "코드가 틀렸습니다.",
                icon:  "error"
            });
        }
    })
}
////-------------------////