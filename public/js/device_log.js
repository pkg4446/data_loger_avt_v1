if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else if(localStorage.getItem('device') === null){
    window.location.href = '/web/select';
}else{
    document.getElementById('data_day').value = new Date().toISOString().substring(0, 10);
    getdata(new Date());
}

const temperatures  = {};

function date_parser(data_day) {
    return ""+data_day.getFullYear()+data_day.getMonth()+data_day.getDate();
}

function day_change(flage){
    console.log(temperatures);
    let data_day = new Date(document.getElementById('data_day').value);
    if(flage){
        data_day.setDate(data_day.getDate()+1);
    }else{
        data_day.setDate(data_day.getDate()-1);
    }
    document.getElementById('data_day').value = data_day.toISOString().substring(0, 10);
    const date_data = date_parser(data_day);
    if(new Date().toISOString().substring(0, 10) === document.getElementById('data_day').value || temperatures[date_data] === undefined){
        console.log("post!");
        getdata(data_day);
    }else{

    }
}

function getdata(date_now){
    const userid    = localStorage.getItem('user');
    const token     = localStorage.getItem('token');
    const device    = localStorage.getItem('device');

    fetch(window.location.protocol+"//"+window.location.host+"/hive/log", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id:     userid,
            token:  token,
            dvid:   device,
            date:   [date_now.getFullYear(),date_now.getMonth(),date_now.getDate()]
        })
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
        const res       = data.split("\r\n");
        const date_data = date_parser(date_now);

        if(temperatures[date_data] === undefined) temperatures[date_data] = [];

        if(res[0] == "log"){
            for (let index = 1; index < res.length-1; index++) {
                temperatures[date_data].push(JSON.parse(res[index]));
            }
        }else{
            temperatures[date_data] = [];
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    });
}