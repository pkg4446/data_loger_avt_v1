const admin_page = {
    user:      null,
    device:    null
};
admin_check();
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
    <th>ID</th><th>이름</th><th>농장</th><th>주소</th><th>전화</th><th>최근 접속</th>
    </tr></thead><tbody>`;
    for (const user_id in user_list) {
        const user_info = user_list[user_id];
        const user_date = new Date(user_info.date);
        HTML_scrpit += `<tr>
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
    let HTML_scrpit = `<table class="data-table"><thead><tr>
    <th>IP</th><th>ID</th><th>등록 유저</th></tr></thead><tbody>`;
    for (const device_ip in device_list) {
        let ip_once = true;
        for (const device_id in device_list[device_ip]) {
            let user_id = device_list[device_ip][device_id].USER;
            if(user_id == null){
                user_id       = "미등록";
                HTML_scrpit  += `<tr onclick=device_regist("${device_ip}","${device_id}")>`;
            }
            else HTML_scrpit += `<tr onclick=device_del("${device_ip}","${device_id}","${user_id}")>`;
            if(ip_once){
                ip_once = false;
                HTML_scrpit += `<td>${device_ip}</td>`;
            }else{
                HTML_scrpit += `<td></td>`;
            }
            HTML_scrpit += `<td>${device_id}</td><td>${user_id}</td></tr>`;
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
            admin_login();
        }else if (response.status==409) {
            throw new Error('이미 등록된 장비입니다.');
        }else if (response.status==200) {
            if(api == "connect"){alert_swal("success","장비를 계정에 연결했습니다.");}
            else if(api == "disconnect"){
                user_id = null;
                alert_swal("info","장비연결을 해지했습니다.");
            }
            admin_page.device[device_ip][device_id].USER = user_id;
            device_list_view(admin_page.device);
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
function device_del(devip,devid,userid) {
    let del_code = "";
    for (let index = 0; index < 4; index++) {
        del_code += ascii();
    }
    Swal.fire({
        title: "연결 해제",
        input: "text",
        text: del_code + "를 입력하세요.",
        showCancelButton: true,
        inputPlaceholder: del_code,
        confirmButtonText: "변경",
        cancelButtonText:  "취소"
    }).then((result) => {
        if (result.isConfirmed){
            if(result.value === del_code){
                fetch_device_change("disconnect",devip,devid,userid);
            }else{
                Swal.fire({
                    title: "해제 코드가 틀렸습니다.",
                    text: del_code +" != "+result.value,
                    icon: "error"
                });
            }
        }
    });
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