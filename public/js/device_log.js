const calibration = 2;
if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else if(localStorage.getItem('device') === null){
    window.location.href = '/web/select';
}else{
    document.getElementById('data_day').value = new Date().toISOString().substring(0, 10);
    getdata(new Date());
}
////--------------------------------------------------------------------////
const temperatures  = {};
////--------------------------------------------------------------------////
function date_parser(data_day) {
    return ""+data_day.getFullYear()+data_day.getMonth()+data_day.getDate();
}
////-------------------////
function time_parser(data_day) {
    let minute = data_day.getMinutes();
    if(minute<10) minute = "0"+minute;
    return ""+data_day.getHours()+":"+minute;
}
////-------------------////
function day_change(flage){
    let data_day = new Date(document.getElementById('data_day').value);
    if(flage){
        data_day.setDate(data_day.getDate()+1);
    }else{
        data_day.setDate(data_day.getDate()-1);
    }
    document.getElementById('data_day').value = data_day.toISOString().substring(0, 10);
    const date_data = date_parser(data_day);

    if(temperatures[date_data] === undefined){
        getdata(data_day);
    }else{
        echarts_draw(temperatures[date_data]);
    }
}
////-------------------////
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
            for (let index = 1; index < res.length; index++) {
                temperatures[date_data].push(JSON.parse(res[index]));
            }
        }else{
            temperatures[date_data] = [];
        }
        echarts_draw(temperatures[date_data]);
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    });
}
////-------------------////
function echarts_draw(draw_data) {
    const option_basic = {
        tooltip: {trigger: 'axis'},
        toolbox: {
            show: true,
            feature: {
                dataZoom:  { yAxisIndex: 'none'},
                dataView:  { readOnly: false },
                magicType: { type: ['line', 'bar'] }
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: {
            type: 'value',
            axisLabel: {formatter: '{value} °C'}
        },
        series: []
    };
    const data_number = 5;
    for (let index = 0; index < data_number; index++) {
        option_basic.series.push(
            {
                name: "벌통_"+(index+1),
                type: 'line',
                data: [],
                markPoint: {data: [{ type: 'max', name: 'Max' },{ type: 'min', name: 'Min' }]},
                markLine:  {data: [{ type: 'average', name: 'Avg' }]}
            }
        );
    }
    
    let moving_average = 1;
    const average_length_minute = 30; //이동평균 범위
    if(draw_data.length>1){
        const data_date0 = new Date(draw_data[0].date);
        const data_date1 = new Date(draw_data[1].date);
        moving_average = average_length_minute/Math.round((data_date1-data_date0)/(60*1000));//이동평균
    }
    if(draw_data != undefined && draw_data.length != 0){
        for (let index = 0; index < draw_data.length; index++) {
            const data_date = new Date(draw_data[index].date);
            option_basic.xAxis.data.push(time_parser(data_date));
        }
    }
    const option_hm = JSON.parse(JSON.stringify(option_basic));
    const option_ic = JSON.parse(JSON.stringify(option_basic));
    const option_tm = JSON.parse(JSON.stringify(option_basic));
    const option_ht = JSON.parse(JSON.stringify(option_basic));
    const option_vi = JSON.parse(JSON.stringify(option_basic));
    option_hm.yAxis.axisLabel.formatter = '{value} %'
    option_ht.yAxis.axisLabel.formatter = '{value} W'
    option_vi.yAxis.axisLabel.formatter = '{value} Wh'

    let energy_use = {};
    
    let sht_temp = {};
    let sht_humi = {};
    let Thermocouple = {};

    if(draw_data != undefined && draw_data.length != 0){
        for (let index = 0; index < draw_data.length; index++) {
            for (let axis_x = 0; axis_x < data_number; axis_x++) {
                option_ht.series[axis_x].data.push((draw_data[index].WK[axis_x]/draw_data[index].GAP*40).toFixed(2));
                if(energy_use[axis_x] == undefined) energy_use[axis_x] = 0;
                energy_use[axis_x] += draw_data[index].WK[axis_x]/90;
                option_vi.series[axis_x].data.push(energy_use[axis_x].toFixed(2));//90=3600/40
                //위쪽은 가온판 출력
                // option_hm.series[axis_x].data.push(draw_data[index].HM[axis_x]);
                // option_ic.series[axis_x].data.push(draw_data[index].IC[axis_x]);
                // option_tm.series[axis_x].data.push(draw_data[index].TM[axis_x]-calibration);
                // 위쪽은 raw, 아래쪽은 moving average.
                if(sht_temp[axis_x] == undefined) sht_temp[axis_x] = [];
                if(sht_humi[axis_x] == undefined) sht_humi[axis_x] = [];
                if(Thermocouple[axis_x] == undefined) Thermocouple[axis_x] = [];
                if(moving_average>index){
                    sht_temp[axis_x].push(parseFloat(draw_data[index].HM[axis_x]));
                    sht_humi[axis_x].push(parseFloat(draw_data[index].IC[axis_x]));
                    Thermocouple[axis_x].push(parseFloat(draw_data[index].TM[axis_x]));
                }else{
                    sht_temp[axis_x][index%moving_average] = parseFloat(draw_data[index].HM[axis_x]);
                    sht_humi[axis_x][index%moving_average] = parseFloat(draw_data[index].IC[axis_x]);
                    Thermocouple[axis_x][index%moving_average] = parseFloat(draw_data[index].TM[axis_x]);
                }
                let moving_temp_ic = 0;
                let moving_humi_ic = 0;
                let moving_temp_air = 0;
                let divide_moving_average = moving_average;
                if(moving_average>index) divide_moving_average = index+1;
                for (let index_t = 0; index_t < divide_moving_average; index_t++) {
                    moving_temp_ic += sht_temp[axis_x][index_t];
                    moving_humi_ic += sht_humi[axis_x][index_t];
                    moving_temp_air += Thermocouple[axis_x][index_t];
                }
                const ans_ic_temp  = moving_temp_ic/divide_moving_average;
                const ans_ic_humi  = moving_humi_ic/divide_moving_average;
                const ans_air_temp = (moving_temp_air/divide_moving_average)-calibration;
                option_hm.series[axis_x].data.push(ans_ic_temp.toFixed(2));
                option_ic.series[axis_x].data.push(ans_ic_humi.toFixed(2));
                option_tm.series[axis_x].data.push(ans_air_temp.toFixed(2));
            }
        }
    }

    let chartDomIC = document.getElementById('hive_graph_temp');
    let chartDomHM = document.getElementById('hive_graph_humi');
    let chartDomTM = document.getElementById('hive_graph_air');
    let chartDomHT = document.getElementById('hive_graph_heat');
    let chartDomVI = document.getElementById('hive_graph_energy');
    let chart_ic = echarts.init(chartDomIC, null, {renderer: 'canvas',useDirtyRect: false});
    let chart_hm = echarts.init(chartDomHM, null, {renderer: 'canvas',useDirtyRect: false});
    let chart_tm = echarts.init(chartDomTM, null, {renderer: 'canvas',useDirtyRect: false});
    let chart_ht = echarts.init(chartDomHT, null, {renderer: 'canvas',useDirtyRect: false});
    let chart_vi = echarts.init(chartDomVI, null, {renderer: 'canvas',useDirtyRect: false});
    chart_hm.setOption(option_hm);
    chart_ic.setOption(option_ic);
    chart_tm.setOption(option_tm);
    chart_ht.setOption(option_ht);
    chart_vi.setOption(option_vi);
    window.addEventListener('resize', chart_hm.resize);
    window.addEventListener('resize', chart_ic.resize);
    window.addEventListener('resize', chart_tm.resize);
    window.addEventListener('resize', chart_ht.resize);
    window.addEventListener('resize', chart_vi.resize);
}
////-------------------////