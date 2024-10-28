if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}
document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const userid    = localStorage.getItem('user');
    const token     = localStorage.getItem('token');
    const device    = document.getElementById('device').value;
    const device_name  = document.getElementById('device_name').value;

    fetch(window.location.protocol+"//"+window.location.host+"/user/connect", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id:     userid,
            token:  token,
            dvid:   device,
            name:   device_name
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
        }else{
            alert('장비 등록!');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('장비 등록 중 오류가 발생했습니다.');
    });
});