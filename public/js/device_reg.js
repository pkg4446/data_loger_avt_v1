if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}
document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const userid    = localStorage.getItem('user');
    const token     = localStorage.getItem('token');
    const device    = document.getElementById('device').value;
    const location  = document.getElementById('location').value;

    fetch(window.location.protocol+"//"+window.location.host+"/user/connect", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id:     userid,
            token:  token,
            dvid:   device,
            name:   location
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
        if (data != "nodata" && data != "password" && data != "userid") {
            alert('장비 등록!');
            window.location.href = '/web/select';
        } else {
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('장비 등록 중 오류가 발생했습니다.');
    });
});