const option = {
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


// const waterChart = echarts.init(document.querySelector('#tab-statistics>.water-box>.content>.chart'));
// const electricChart = echarts.init(document.querySelector('#tab-statistics>.electric-box>.content>.chart'));
// const lightChart = echarts.init(document.querySelector('#tab-statistics>.light-box>.content>.chart'));

// waterChart.setOption(option);
// electricChart.setOption(option);
// lightChart.setOption(option);

const chart_water_1 = echarts.init(document.querySelector('#tab-water>.chart-1'));
const chart_water_2 = echarts.init(document.querySelector('#tab-water>.chart-2'));
const chart_water_3 = echarts.init(document.querySelector('#tab-water>.chart-3'));

const chart_electric_1 = echarts.init(document.querySelector('#tab-electric>.chart-1'));
const chart_electric_2 = echarts.init(document.querySelector('#tab-electric>.chart-2'));
const chart_electric_3 = echarts.init(document.querySelector('#tab-electric>.chart-3'));


/**
 * @name 创建饼状图配置
 * @param {*} config 
 */
const createChartOption1 = (config) => {
    const {
        titleText,
        seriesName,
        seriesData
    } = config;

    const option = {
        title: {
            text: titleText,
            left: '38.5%',
            top: '14%',
            textStyle: {
                color: '#484848',
                fontSize: 14,
                fontWeight: 'normal',
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}t ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: '60%',
            top: '31%',
            icon: 'circle',
            formatter: function (name) {
                const datas = water_chart_1_option.series[0].data;

                let value = datas[0].value
                let total = 0;

                for (const data of datas) {
                    total += data.value;
                    if (data.name == name) {
                        value = data.value;
                    }
                }

                const rate = value / total * 100;
                return `${name}: ${value}t / ${rate.toFixed(2)}%`
            }
        },
        series: [{
            name: seriesName,
            type: 'pie',
            radius: ['26%', '40%'],
            center: ['42%', '40%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    show: true,
                    textStyle: {
                        fontSize: '30',
                        fontWeight: 'bold'
                    }
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: seriesData
        }]
    };

    return option
}

/**
 * @name 创建柱状图配置
 * @param {*} config 
 */
const createChartOption2 = (config) => {
    const {
        titleText,
        xAxisData,
        seriesData,
    } = config;

    const option = {
        title: {
            text: titleText,
            top: '8%',
            left: 'center',
            textStyle: {
                color: '#484848',
                fontSize: 14,
                fontWeight: 'normal',
            }
        },
        grid: {
            left: 'center',
            top: '20%',
            height: '50%',
            width: '75%',
        },
        xAxis: {
            type: 'category',
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                rotate: -20,
                color: '#999999',
                lineHeight: 14,
                margin: 60,
                formatter: function (value) {
                    return value.split("").join("\n");
                },
            },
            data: xAxisData,
        },
        yAxis: {
            type: 'value',
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                color: '#999999',
            },
        },
        series: [{
            data: seriesData,
            type: 'bar',
            barCategoryGap: '50%',
            itemStyle: {
                color: '#cccccc'
            },
            emphasis: {
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 1,
                            color: '#ffc742' // 0% 处的颜色
                        }, {
                            offset: 0,
                            color: '#fbe072' // 100% 处的颜色
                        }],
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    backgroundColor: '#324157',
                    color: '#ffff',
                    padding: [10, 20],
                    distance: 10,
                    borderRadius: 5,
                    fontSize: 14,
                }
            }
        }],
        toolbox: {
            show: true,
            top: 30,
            right: 30,
            itemSize: 72,
            width: 72,
            height: 32,
            feature: {
                myBack: {
                    show: true,
                    title: '回到饼图',
                    icon: `image://./img/icon/btn_back.png`,
                    onclick: function (event, event2) {
                        const wrap = event2.getDom();
                        $(wrap).removeClass('active').siblings('.chart-1').addClass('active')
                    }
                }
            }
        }
    };

    return option
}


/**
 * @name 创建折线图配置
 * @param {*} config 
 */
const createChartOption3 = (config) => {
    const {
        titleText,
        seriesData,
    } = config;

    const option = {
        title: {
            text: titleText,
            top: '8%',
            left: 'center',
            textStyle: {
                color: '#484848',
                fontSize: 14,
                fontWeight: 'normal',
            }
        },
        grid: {
            left: 'center',
            top: '20%',
            height: '50%',
            width: '75%',
        },
        xAxis: {
            type: 'category',
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                color: '#999999',
                margin: 20,
            },
            data: [
                '一月',
                '二月',
                '三月',
                '四月',
                '五月',
                '六月',
                '七月',
                '八月',
                '九月',
                '十月',
                '十一月',
                '十二月',
            ],
        },
        yAxis: {
            type: 'value',
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                color: '#999999',
            },
        },
        series: [{
            data: seriesData,
            type: 'line',
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 1,
                        color: '#ffffff' // 0% 处的颜色
                    }, {
                        offset: 0,
                        color: '#babfc4' // 100% 处的颜色
                    }],
                }
            },
            lineStyle: {
                color: '#4b5054',
            },
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
                color: '#1f2d3d',
            },
            emphasis: {
                label: {
                    show: true,
                    position: 'top',
                    backgroundColor: '#324157',
                    color: '#ffff',
                    padding: [10, 20],
                    distance: 10,
                    borderRadius: 5,
                    fontSize: 14,
                }
            }
        }],
        toolbox: {
            show: true,
            top: 30,
            right: 30,
            feature: {
                myBack: {
                    show: true,
                    title: '回到柱图',
                    icon: 'image://./img/icon/btn_back.png',
                    width: 72,
                    height: 32,
                    onclick: function (event, event2) {
                        const wrap = event2.getDom();
                        $(wrap).removeClass('active').siblings('.chart-2').addClass('active')
                    }
                }
            }
        }
    };

    return option
}

// 生成水表饼状图配置
const water_chart_1_option = createChartOption1({
    titleText: '耗水占比统计',
    seriesName: '用水区域',
    seriesData: [ // 饼图内容信息
        {
            value: 335,
            name: '厨房',
            itemStyle: {
                color: '#985ef9'
            }
        },
        {
            value: 310,
            name: '卫生间',
            itemStyle: {
                color: '#ffc742'
            }
        },
        {
            value: 234,
            name: '空气热泵补水',
            itemStyle: {
                color: '#ff6e42'
            }
        },
        {
            value: 135,
            name: '垂直绿化',
            itemStyle: {
                color: '#ff5886'
            }
        },
        {
            value: 1548,
            name: '直饮水',
            itemStyle: {
                color: '#00c4aa'
            }
        },
        {
            value: 1548,
            name: '生活用水',
            itemStyle: {
                color: '#00a3fb'
            }
        }
    ]
});
// 生成电表饼状图配置
const electric_chart_1_option = createChartOption1({
    titleText: '耗电占比统计',
    seriesName: '用电区域',
    seriesData: [ // 饼图内容信息
        {
            value: 335,
            name: '照明',
            itemStyle: {
                color: '#985ef9'
            }
        },
        {
            value: 310,
            name: '应急照明',
            itemStyle: {
                color: '#ffc742'
            }
        },
        {
            value: 234,
            name: '空调内机',
            itemStyle: {
                color: '#ff6e42'
            }
        },
        {
            value: 135,
            name: '空调外机',
            itemStyle: {
                color: '#ff5886'
            }
        },
        {
            value: 1548,
            name: '厨房',
            itemStyle: {
                color: '#00c4aa'
            }
        },
    ]
})

// 柱状图x轴标签原型
const xAxisFloors = [
    '北楼一层',
    '北楼二层',
    '北楼三层',
    '北楼四层',
    '北楼五层',
    '北楼六层',
    '南楼一层',
    '南楼二层',
    '南楼三层',
    '南楼四层',
    '南楼五层',
    '南楼六层',
    '南楼七层',
];
/**
 * @name 创建楼层列表
 * @param {string} typeName 耗能类型名称
 */
const createXAxisData = (typeName) => {
    return xAxisFloors.map(floor => {
        return floor += typeName;
    })
}



chart_water_1.setOption(water_chart_1_option);
chart_electric_1.setOption(electric_chart_1_option);

// 绑定水表饼图点击
chart_water_1.on('click', function (event) {
    console.log('event', event);
    $('#tab-water').find('>.chart-1').removeClass('active');
    $('#tab-water').find('>.chart-2').addClass('active');

    const name = event.name;

    // 生成水表柱状图配置
    const water_chart_2_option = createChartOption2({
        titleText: `各层${name}总耗水(t)`,
        xAxisData: createXAxisData(name),
        seriesData: [120, 190, 150, 80, 70, 110, 120, 180, 150, 80, 70, 110, 130],
    });

    chart_water_2.resize();
    chart_water_2.setOption(water_chart_2_option);
});

// 绑定电表饼图点击
chart_electric_1.on('click', function (event) {
    console.log('event', event);
    $('#tab-electric').find('>.chart-1').removeClass('active');
    $('#tab-electric').find('>.chart-2').addClass('active');

    const name = event.name;
    // 生成电表柱状图配置
    const electric_chart_2_option = createChartOption2({
        titleText: `各层${name}总用能耗(kw)`,
        xAxisData: createXAxisData(name),
        seriesData: [120, 190, 150, 80, 70, 110, 120, 180, 150, 80, 70, 110, 130],
    })

    chart_electric_2.resize();
    chart_electric_2.setOption(electric_chart_2_option);
});



chart_water_2.on('click', function (event) {
    console.log('event', event);
    $('#tab-water').find('>.chart-2').removeClass('active');
    $('#tab-water').find('>.chart-3').addClass('active');

    const name = event.name;

    // 生成水表折线图配置
    const water_chart_3_option = createChartOption3({
        titleText: `${name}每月耗水(kw)`,
        seriesData: [120, 190, 150, 80, 70, 110, 120, 180, 150, 80, 70, 110],
    });

    chart_water_3.resize();
    chart_water_3.setOption(water_chart_3_option);
})

chart_electric_2.on('click', function (event) {
    console.log('event', event);
    $('#tab-electric').find('>.chart-2').removeClass('active');
    $('#tab-electric').find('>.chart-3').addClass('active');

    const name = event.name;

    // 生成电表折线图配置
    const electric_chart_3_option = createChartOption3({
        titleText: `${name}每月能耗(kw)`,
        seriesData: [120, 190, 150, 80, 70, 110, 120, 180, 150, 80, 70, 110],
    })

    chart_electric_3.resize();
    chart_electric_3.setOption(electric_chart_3_option);
})