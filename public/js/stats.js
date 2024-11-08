function get_data() {
    fetch(window.location.protocol+"//"+window.location.host+"/common/hive_stat", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: null
    })
    .then(response => {
        console.log(response);
        return response.text(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        console.log(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
function draw_map() {
}
get_data();