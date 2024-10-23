if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    document.getElementById('login').textContent = "로그인";
}
document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const userid    = document.getElementById('userid').value;
    const password  = document.getElementById('password').value;
    const passcheck = document.getElementById('passcheck').value;
    const username  = document.getElementById('username').value;
    const phonenum  = document.getElementById('userphone').value;

    fetch(window.location.protocol+"//"+window.location.host+"/user/join", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id:     userid,
            pass:   password,
            check:  passcheck,
            name:   username,
            tel:    phonenum
        })
    })
    .then(response => {
        response.status
        if (response.status==400) {
            throw new Error('아이디 또는 비밀번호가 누락됐습니다.');
        }else if (response.status==403) {
            throw new Error('비밀번호가 다릅니다.');
        }else if (response.status==406) {
            throw new Error('이미 가입된 아이디 입니다.');
        }
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        if (data != "nodata" && data != "password" && data != "userid") {
            alert('가입 성공!');
            window.location.href = '/web/login';
        } else {
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
    });
});