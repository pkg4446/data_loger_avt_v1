if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else if(localStorage.getItem('device') === null){
    window.location.href = '/web/select';
}else{
    document.getElementById('data_day').value = new Date().toISOString().substring(0, 10);
    getdata(new Date());
}

const temperatures  = {};
const times         = {};

function day_change(flage){
    let data_day = new Date(document.getElementById('data_day').value);
    if(flage){
        data_day.setDate(data_day.getDate()+1);
    }else{
        data_day.setDate(data_day.getDate()-1);
    }
    document.getElementById('data_day').value = data_day.toISOString().substring(0, 10);
    const date_data = ""+data_day.getFullYear()+data_day.getMonth()+data_day.getDate();
    if(new Date().toISOString().substring(0, 10) === document.getElementById('data_day').value || temperatures[date_data] === undefined){
        console.log("post!");
        getdata(data_day);
    }else{
        drawing(date_data);
    }
}

function getColor(temp) {
    const minTemp = 0;
    const maxTemp = 50;
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

function updateHoneycomb(key, timeIndex) {
    if(timeIndex<temperatures[key].length){
        const honeycomb = document.getElementById('honeycomb');
        honeycomb.innerHTML = '';
        let rowsData = temperatures[key][timeIndex];
        rowsData.forEach((row) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';
            row.forEach(temp => {
                const temp_correction = (temp/100).toFixed(1);
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = temp_correction;
                cell.style.backgroundColor = getColor(temp_correction);
                rowElement.appendChild(cell);
            });
            honeycomb.appendChild(rowElement);
        });
        const time_log = new Date(times[key][timeIndex]);
        document.getElementById('timeDisplay').textContent = `시간: ${time_log.getFullYear()}년 ${time_log.getMonth()+1}월 ${time_log.getDate()}일 ${time_log.getHours()}시 ${time_log.getMinutes()}분`;
    }
}

function drawing(key){
    document.getElementById('controller').innerHTML=`<button id="prevBtn">이전</button>
    <input type="range" id="timeSlider" min="0" max="0" value="0">
    <button id="nextBtn">다음</button>`;
    const slider    = document.getElementById('timeSlider');
    const prevBtn   = document.getElementById('prevBtn');
    const nextBtn   = document.getElementById('nextBtn');
    let  data_max   = temperatures[key].length-1;
    if(data_max<0) data_max = 0;
    slider.max      = data_max;
    slider.value    = data_max;
    if(data_max>0){
        slider.addEventListener('input', () => updateHoneycomb(key, parseInt(slider.value)));
        prevBtn.addEventListener('click', () => {
            let sliver_val  = parseInt(slider.value);
            if(sliver_val>0)  sliver_val -= 1;
            slider.value    = sliver_val;
            updateHoneycomb(key, sliver_val);
        });
        nextBtn.addEventListener('click', () => {
            let sliver_val  = parseInt(slider.value);
            if(sliver_val<data_max) sliver_val += 1;
            slider.value    = sliver_val;
            updateHoneycomb(key, sliver_val);
        });
        window.addEventListener('resize', () => {
            updateHoneycomb(key, parseInt(slider.value));
        });
    }
    updateHoneycomb(key, data_max);
}

function getdata(date_now){
    const userid    = localStorage.getItem('user');
    const token     = localStorage.getItem('token');
    const device    = localStorage.getItem('device');

    fetch(window.location.protocol+"//"+window.location.host+"/user/log", {
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
        const date_data = ""+date_now.getFullYear()+date_now.getMonth()+date_now.getDate();
        if(temperatures[date_data] === undefined) temperatures[date_data] = [];
        if(times[date_data] === undefined) times[date_data] = [];
        
        temperatures[date_data] = [];
        times[date_data]        = [];

        if(res[0] == "log"){
            for (let index = 1; index < res.length-1; index++) {
                let temperature = [];
                const json = JSON.parse(res[index]);
                times[date_data].push(json.date);
                temperature.push(json.row0);
                temperature.push(json.row1);
                temperature.push(json.row2);
                temperature.push(json.row3);
                temperature.push(json.row4);
                temperatures[date_data].push(temperature);
            }
        }else{
            temperatures[date_data]    = [[]];
            times[date_data]           = [date_now];
        }
        drawing(date_data);
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    });
}