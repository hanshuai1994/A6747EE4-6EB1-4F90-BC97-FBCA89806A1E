
/**
 * @name 创建空气系统单个标签
 * @param {*} data 空气系统单个标签数据
 */
const createAirStateItem = (data) => {
    return `<div class="state-view ${data.className?data.className:''}">
                <p class="label-v">${data.label}</p>
                <p class="info">${data.value}</p>
            </div>`
}

/**
 * @根据数据组生成dom
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
 * @根据数据组生成房间项目dom
 * @param {string} data 房间号数据
 */
const createRoomItem = (data) => {
    return `<li><a href="#" data-index="${data}">${data}室</a></li>`
} 

/**
 * @根据数据组生成房间列表dom
 * @param {array} array 房间号数据数组
 */
const createRoomList = (array) => {
    let result = '';

    for (const data of array) {
        result += createRoomItem(data);
    }

    return result
}