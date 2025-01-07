const calibration = 2;
if(localStorage.getItem('user')==null || localStorage.getItem('token')==null){
    window.location.href = '/web/login';
}else if(localStorage.getItem('device') === null){
    window.location.href = '/web/select';
}else{
    document.getElementById('divece_name').innerText = localStorage.getItem('device');
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
        const today = new Date();
        if(today<data_day) data_day = today;
    }else{
        data_day.setDate(data_day.getDate()-1);
    }
    document.getElementById('data_day').value = data_day.toISOString().substring(0, 10);
    const date_data = date_parser(data_day);
    if(temperatures[date_data] === undefined){
        getdata(data_day);
    }else{
        draw_chart(date_data);
    }
}
function draw_chart(date_data){
    data_button(false);
    echarts_draw(temperatures[date_data],5,false,"°C","hive_graph_temp","IC",0);
    echarts_draw(temperatures[date_data],5,false,"%","hive_graph_humi","HM",0);
    echarts_draw(temperatures[date_data],5,false,"°C","hive_graph_air","TM",calibration);
    echarts_draw_heater(temperatures[date_data],5);
}
////-------------------////
function data_type(index,raw){
    data_button(raw);
    const date_data = date_parser(new Date(document.getElementById('data_day').value));
    echarts_draw(temperatures[date_data],index,raw,"°C","hive_graph_temp","IC",0);
    echarts_draw(temperatures[date_data],index,raw,"%","hive_graph_humi","HM",0);
    echarts_draw(temperatures[date_data],index,raw,"°C","hive_graph_air","TM",calibration);
    echarts_draw_heater(temperatures[date_data],index);
}
////-------------------////
function data_independent(type,index,raw){
    const date_data = date_parser(new Date(document.getElementById('data_day').value));
    if(type == 0){      echarts_draw(temperatures[date_data],index,raw,"°C","hive_graph_temp","IC",0);
    }else if(type == 1){echarts_draw(temperatures[date_data],index,raw,"%","hive_graph_humi","HM",0);
    }else if(type == 2){echarts_draw(temperatures[date_data],index,raw,"°C","hive_graph_air","TM",calibration);
    }else{              echarts_draw_heater(temperatures[date_data],index);}
}
////-------------------////
function data_button(raw){
    let HTML_script = '<button class="search-btn" onclick="data_type(5,';
    let data_type   = "";
    if(raw){
        data_type   = "true";
        HTML_script += 'false)">RAW';
    }else{
        data_type   = "false";
        HTML_script += 'true)">MOV';
    }
    HTML_script += "</button>"
    document.getElementById('data_type').innerHTML = HTML_script;
    for (let index = 0; index < 4; index++) {
        HTML_script =   `<button class="search-btn" onclick="data_independent(${index},5,${data_type})">All</button>
                    <button class="search-btn btn-type1" onclick="data_independent(${index},0,${data_type})">1</button>
                    <button class="search-btn btn-type2" onclick="data_independent(${index},1,${data_type})">2</button>
                    <button class="search-btn btn-type3" onclick="data_independent(${index},2,${data_type})">3</button>
                    <button class="search-btn btn-type4" onclick="data_independent(${index},3,${data_type})">4</button>
                    <button class="search-btn btn-type5" onclick="data_independent(${index},4,${data_type})">5</button>`;
        document.getElementById(`data_index${index}`).innerHTML = HTML_script;
    }
}
////-------------------////
function getdata(date_now){
    const userid    = localStorage.getItem('user');
    const token     = localStorage.getItem('token');
    const device    = localStorage.getItem('macaddr');

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
        draw_chart(date_data);
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    });
}
////-------------------////
function echarts_draw(draw_data,hive_index,raw,fromat,dom,data,calibrate) {
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
            min:-20,
            max:50,
            axisLabel: {formatter: '{value} '+fromat}
        },
        series: []
    };
    if(data == "HM"){
        option_basic.yAxis.min = 0;
        option_basic.yAxis.max = 100;
    }else if(data == "TM") option_basic.yAxis.min = -10;
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
        moving_average = average_length_minute/Math.round(draw_data[0].GAP/60);
        // const data_date0 = new Date(draw_data[0].date);
        // const data_date1 = new Date(draw_data[1].date);
        // moving_average = average_length_minute/Math.round((data_date1-data_date0)/(60*1000));//이동평균
    }
    if(draw_data != undefined && draw_data.length != 0){
        for (let index = 0; index < draw_data.length; index++) {
            const data_date = new Date(draw_data[index].date);
            option_basic.xAxis.data.push(time_parser(data_date));
        }
    }
    const option = JSON.parse(JSON.stringify(option_basic));
    let   moving = {};

    if(draw_data != undefined && draw_data.length != 0){
        for (let index = 0; index < draw_data.length; index++) {
            for (let axis_x = 0; axis_x < data_number; axis_x++) {
                if(hive_index == data_number || axis_x == hive_index){
                    if(raw){
                        option.series[axis_x].data.push(draw_data[index][data][axis_x]-calibrate);
                    }else{
                        if(moving[axis_x] == undefined) moving[axis_x] = [];
                        if(moving_average>index){
                            moving[axis_x].push(parseFloat(draw_data[index][data][axis_x]));
                        }else{
                            moving[axis_x][index%moving_average] = parseFloat(draw_data[index][data][axis_x]);
                        }
                        let moving_data = 0;
                        let divide_moving_average = moving_average;
                        if(moving_average>index) divide_moving_average = index+1;
                        for (let index_t = 0; index_t < divide_moving_average; index_t++) {
                            moving_data += moving[axis_x][index_t];
                        }
                        const ans_data = (moving_data/divide_moving_average)-calibrate;
                        option.series[axis_x].data.push(ans_data.toFixed(2));
                    }
                }
            }
        }
    }
    let chartDom = document.getElementById(dom);
    let chart    = echarts.init(chartDom, null, {renderer: 'canvas',useDirtyRect: false});
    chart.setOption(option);
    window.addEventListener('resize', chart.resize);
}
////-------------------////

////-------------------////
function echarts_draw_heater(draw_data,hive_index) {
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
            min:0,
            max:40,
            axisLabel: {formatter: '{value}'}
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

    if(draw_data != undefined && draw_data.length != 0){
        for (let index = 0; index < draw_data.length; index++) {
            const data_date = new Date(draw_data[index].date);
            option_basic.xAxis.data.push(time_parser(data_date));
        }
    }

    const option_ht = JSON.parse(JSON.stringify(option_basic));
    delete option_basic.yAxis.min;
    delete option_basic.yAxis.max;
    const option_vi = JSON.parse(JSON.stringify(option_basic));
    option_ht.yAxis.axisLabel.formatter = '{value} W'
    option_vi.yAxis.axisLabel.formatter = '{value} Wh'

    let energy_use = {};
    
    if(draw_data != undefined && draw_data.length != 0){
        for (let index = 0; index < draw_data.length; index++) {
            for (let axis_x = 0; axis_x < data_number; axis_x++) {
                if(hive_index == data_number || axis_x == hive_index){
                    option_ht.series[axis_x].data.push((draw_data[index].WK[axis_x]/draw_data[index].GAP*40).toFixed(2));
                    if(energy_use[axis_x] == undefined) energy_use[axis_x] = 0;
                    energy_use[axis_x] += draw_data[index].WK[axis_x]/90;
                    option_vi.series[axis_x].data.push(energy_use[axis_x].toFixed(2));//90=3600/40
                }
            }
        }
    }
    let chartDomHT = document.getElementById('hive_graph_heat');
    let chartDomVI = document.getElementById('hive_graph_energy');
    let chart_ht = echarts.init(chartDomHT, null, {renderer: 'canvas',useDirtyRect: false});
    let chart_vi = echarts.init(chartDomVI, null, {renderer: 'canvas',useDirtyRect: false});
    chart_ht.setOption(option_ht);
    chart_vi.setOption(option_vi);
    window.addEventListener('resize', chart_ht.resize);
    window.addEventListener('resize', chart_vi.resize);
}
////-------------------////