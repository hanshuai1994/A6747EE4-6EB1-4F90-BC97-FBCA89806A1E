option = {
    grid: {
        left: 42,
        top: 23,
        right: 10,
        bottom: 48,
    },
    xAxis: {
        type: 'category',
        data: [
            '01:00',
            '02:00',
            '03:00',
            '04:00',
            '05:00',
            '06:00',
            '07:00',
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
        ],
        axisLine: {
            show: false,
        },
        axisTick: {
            show: false,
        },
        axisLabel: {
            color: '#999999',
            margin: 14,
            align: 'center',
        },  
    },
    yAxis: {
        type: 'value',
        interval: 50,
        axisLine: {
            show: false,
        },
        axisTick: {
            show: false,
        },
        axisLabel: {
            color: '#999999',
            margin: 20,
            align: 'center',
        },
    },
    series: [{     
        type: 'bar',
        data: [
            120,
            200,
            150,
            80,
            70,
            110,
            130,
            120,
            200,
            150,
            80,
            70,
            110,
            130,
        ],
        itemStyle: {
            color: '#324157',
            borderColor: '#324157',
        },
        barWidth: '100%',
    }]
};


const waterChart = echarts.init(document.querySelector('#tab-statistics>.water-box>.content>.chart'));
const electricChart = echarts.init(document.querySelector('#tab-statistics>.electric-box>.content>.chart'));
const lightChart = echarts.init(document.querySelector('#tab-statistics>.light-box>.content>.chart'));

waterChart.setOption(option);
electricChart.setOption(option);
lightChart.setOption(option);