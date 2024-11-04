const admin_page = {
    user:      null,
    device:    null
};
get_admin();
////--------------------------------------------------------------------////
function get_admin() {
    fetch(window.location.protocol+"//"+window.location.host+"/admin/check", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({TOKEN:localStorage.getItem('manager')})
    })
    .then(res => {
        if (res.status==400) {
            Swal.fire({
                position: "top",
                icon:   "question",
                title:  "관리자 로그인",
                input: "text",
                inputPlaceholder: "관리자 KEY를 입력하세요."
            }).then((result)=>{
                fetch(window.location.protocol+"//"+window.location.host+"/admin/authority", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({KEY:result.value})
                }).then(response => {
                    if (response.status==400) {
                        throw new Error('관리자 KEY가 누락됐습니다.');
                    }else if (response.status==403) {
                        throw new Error('KEY가 다릅니다.');
                    }else if (response.status==202) {
                        throw new Error('관리자 KEY가 변경되었습니다.');
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
                    });
                });
            });
        }else{
            data_list();
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
                HTML_scrpit += `<tr onclick=device_regist("${device_id}")>`;
                user_id      = "미등록";
            }
            else HTML_scrpit += "<tr>";
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
function device_regist(devid) {
    Swal.fire({
        title: "장비 이름",
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
                fetch_device_regist(devid,user_id);
            }
        }
    });
}
////-------------------////
function fetch_device_regist(device_id,user_id) {
    const post_data = {
        TOKEN:localStorage.getItem('manager'),
        dvid:   device_id,
        user:   user_id
    }
    fetch(window.location.protocol+"//"+window.location.host+"/admin/connect", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post_data)
    })
    .then(response => {
        if (response.status==400 || response.status==401) {
            alert_swal("error",'정보 누락');
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
////-------------------////
function data_list() {
    if(admin_page.user == null){
        fetch(window.location.protocol+"//"+window.location.host+"/admin/list_data", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({TOKEN:localStorage.getItem('manager')})
        }).then(response => {
            if (response.status==400) {
                throw new Error('다른곳에서 관리자가 로그인 했습니다.');
            }else if (response.status==403) {
                throw new Error('관리자 계정이 새로 접속 했습니다.');
            }
            return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
        })
        .then(data => {
            if (data != "token") {
                const res_data = JSON.parse(data);
                console.log(res_data);

                user_list_view(res_data.user);
                device_list_view(res_data.device);
            } else {
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            Swal.fire({
                position: "top",
                icon:   "error",
                title:  '관리자 로그인 오류가 발생했습니다.',
                text:   error,
                showConfirmButton: false,
                timer:  1500
            });
        });
    }else{
        user_list_view(admin_page.user);
        device_list_view(admin_page.device);
    }
}
////-------------------////