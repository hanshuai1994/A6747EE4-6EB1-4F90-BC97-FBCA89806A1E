// 基于准备好的dom，初始化echarts实例
var chart_water = echarts.init(document.querySelector('#container .echart-box .water'));
var chart_electric = echarts.init(document.querySelector('#container .echart-box .electric'));

// 指定图表的配置项和数据
var option_water = {
    color: ['#3398DB'],
    title: {
        text: '水耗（单位:吨）'
    },
    tooltip: {},
    xAxis: {
        data: ["1月", "2月", "3月", "4月", "5月", "6月"]
    },
    yAxis: [{
        type: 'value',
        axisLabel: {
            interval: 0,
            min: 100,
            max: 600,
        }
    }],
    series: [{
        name: '水耗',
        type: 'bar',
        barWidth: '50%',
        data: [426, 253, 230, 221, 265, 231]
    }]
};

var option_electric = {
    color: ['#FFC000'],
    title: {
        text: '能耗（单位:千瓦时）'
    },
    tooltip: {},

    xAxis: {
        data: ["1月", "2月", "3月", "4月", "5月", "6月"]
    },
    yAxis: [{
        type: 'value',
        axisLabel: {
            interval: 0,
            min: 2000,
            max: 10000,
        }
    }],
    series: [{
        name: '能耗',
        type: 'bar',
        barWidth: '50%',
        data: [5815, 4427, 3129, 3386, 3521, 3484]
    }]
};

chart_water.setOption(option_water);
chart_electric.setOption(option_electric);