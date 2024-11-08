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
        return response.json(); // JSON 대신 텍스트로 응답을 읽습니다.
    })
    .then(data => {
        draw_map(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function getColor(temp) {
    const minTemp = 0;
    const maxTemp = 45;
    const normalizedTemp = (temp - minTemp) / (maxTemp - minTemp);
    let r, g, b;
    if (normalizedTemp < 0.25) {
        b = 255 * (1 - normalizedTemp * 4);
        g = 255 * normalizedTemp * 4;
        r = 0;
    } else if (normalizedTemp < 0.5) {
        b = 0;
        g = 255;
        r = 255 * (normalizedTemp - 0.25) * 4;
    } else if (normalizedTemp < 0.75) {
        b = 0;
        g = 255 * (1 - (normalizedTemp - 0.5) * 4);
        r = 255;
    } else {
        b = 0;
        g = 0;
        r = 255;
    }
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function draw_map(data) {
    const log = JSON.parse(data.log);
    const map = JSON.parse(data.map);
    console.log(log);
    let map_html = `<svg viewBox="0 0 ${map.config.box_size[0]} ${map.config.box_size[1]}">
                    <text x="${map.config.title[0]}" y="${map.config.title[1]}" class="title">지역별 평균 벌집 온도</text>`;
    for (const region in map.geometry) {
        map_html += `<path class="region" d="M${map.geometry[region].start[0]},${map.geometry[region].start[1]} l`;
        for (let index = 0; index < map.geometry[region].point.length; index++) {
            map_html += map.geometry[region].point[index][0]+","+map.geometry[region].point[index][1]+" ";
        }
        map_html += 'z" '
        if((log[region] != undefined)) map_html += `style="fill: ${getColor((log[region].IC/log[region].IC_count).toFixed(2))};"`;
        map_html += `></path>`;
        map_html += `<text class="region-label" x="${map.geometry[region].text[0]}" y="${map.geometry[region].text[1]}">${map.geometry[region].name}</text>`
        if((log[region] != undefined)){
            map_html += `<text class="region-label" x="${map.geometry[region].text[0]}" y="${map.geometry[region].text[1]+15}">🌡️ ${(log[region].IC/log[region].IC_count).toFixed(2)}°C</text>`
            map_html += `<text class="region-label" x="${map.geometry[region].text[0]}" y="${map.geometry[region].text[1]+30}">💧 ${(log[region].HM/log[region].HM_count).toFixed(2)} %</text>`
        }else{
            map_html += `<text class="region-label" x="${map.geometry[region].text[0]}" y="${map.geometry[region].text[1]+15}">🌡️ X</text>`
            map_html += `<text class="region-label" x="${map.geometry[region].text[0]}" y="${map.geometry[region].text[1]+30}">💧 X</text>`
        }
    }
    const data_time = new Date(log.date);
    map_html += `<text x="${map.config.legend[0]}" y="${map.config.legend[1]}" style="font-size: 10px; fill: #666;">*기준: 
    ${data_time.getFullYear()}년 ${data_time.getMonth()}월 ${data_time.getDate()}일 ${data_time.getHours()}시 ${data_time.getMinutes()}분</text></svg>`;
    document.getElementById("map").innerHTML = map_html;
}

get_data();
// draw_map();