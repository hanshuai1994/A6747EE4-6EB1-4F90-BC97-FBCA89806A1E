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
 * @param {string} roomName 房间号数据
 */
const createRoomItem = (roomName) => {
    return `<li><a href="#" data-index="${roomName}">${roomName}室</a></li>`
}

/**
 * @name 根据数据组生成房间列表dom
 * @param {array} rooms 房间号数据数组
 */
const createRoomList = (rooms) => {
    let result = `<li><a href="#" data-index="all">所有房间</a></li>`;

    for (const data of rooms) {
        result += createRoomItem(data.roomName);
    }

    return result
}


/**
 * @name 根据单个数据生成楼层下拉项目dom
 * @param {number|string} index 楼层在数组中的序列号+1
 * @param {string} floorName 单个楼层名
 */
const createFloorItem = (index, floorName) => {
    return `<li><a href="#" data-index="${index}">${floorName}</a></li>`
}

/**
 * @name 根据数据组生成楼层下拉列表dom
 * @param {*} firstData 下拉列表的第一条信息
 * @param {array} floors 一栋楼的楼层信息数据数组
 */
const createFloorList = (floors, firstData) => {
    let result = createFloorItem(firstData.index, firstData.floorName);

    const length = floors.length;

    for (let i = 0; i < length; i++) {
        const floor = floors[i];

        result += createFloorItem(i, floor.floorName);
    }

    return result
}


/**
 * @name 根据单个数据生成首页单个运维项目
 * @param {*} data 单个运维数据
 */
const createOperItem = (data) => {
    return `
    <div class="operate-item" data-id=${data.id?data.id:"new"} data-state=${data.state}>
        <span class="title">${data.title}</span>
        <span class="date">${data.time}</span>
    </div>
    `
}

/**
 * @name 根据数据组生成首页运维项目列表
 * @param {array} array 运维数据数组
 */
const createHomeOperList = (array) => {
    let result = ''
    for (const data of array) {
        result += createOperItem(data);
    }

    return result
}