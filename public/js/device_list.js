document.addEventListener('DOMContentLoaded', function() {
    const list = document.getElementById('equipment-list');
    // 서버에서 데이터를 가져오는 함수
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
            const items = data.split("\r\n");
            list.innerHTML = ''; // 기존 내용을 지웁니다
            for (let index = 0; index < items.length-1; index++) {
                const item = items[index].split(",");
                const li = document.createElement('li');
                li.textContent = item[1];
                li.dataset.hidden = item[0]; // 숨겨진 데이터 저장
                li.addEventListener('click', function() {
                    localStorage.setItem('device', this.dataset.hidden);
                    window.location.href = '/web';
                });
                list.appendChild(li);
            }
        })
        .catch(error => {
            window.location.href = '/web/connect';
        });
    }

    // 페이지 로드 시 데이터를 가져옵니다
    fetchEquipment();
});