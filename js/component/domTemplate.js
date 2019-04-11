/**
 * @name 根据单个数据创建空气系统标签
 * @param {*} data 空气系统单个标签数据
 */
const createAirStateItem = (data) => {
    return `<div class="state-view ${data.className?data.className:''}">
                <p class="label-v">${data.label}</p>
                <p class="info">${data.value}</p>
            </div>`
}

/**
 * @name 根据数据组生成dom
 * @param {array} array 空气系统数据数组
 */
const createAirStateList = (array) => {
    let result = '';

    for (const data of array) {
        result += createAirStateItem(data);
    }

    return result
}


/**
 * @name 根据单个数据生成房间项目dom
 * @param {string} data 房间号数据
 */
const createRoomItem = (data) => {
    return `<li><a href="#" data-index="${data}">${data}室</a></li>`
}

/**
 * @name 根据数据组生成房间列表dom
 * @param {array} array 房间号数据数组
 */
const createRoomList = (array) => {
    let result = '';

    for (const data of array) {
        result += createRoomItem(data);
    }

    return result
}

/**
 * @name 根据单个数据生成首页单个运维项目
 * @param {*} data 单个运维数据
 */
const createHomeOperItem = (data) => {
    return `
    <div class="operate-item" data-id=${data.id?data.id:''} data-state=${data.state}>
        <span class="title">${data.title}</span>
        <span class="date">${data.time}</span>
    </div>
    `
}

/**
 * @name 根据数据组生成首页运维项目列表
 * @param {*} array 
 */
const createHomeOperList = (array) => {
    let result = ''
    for (const data of array) {
        result += createHomeOperItem(data);
    }

    return result
}