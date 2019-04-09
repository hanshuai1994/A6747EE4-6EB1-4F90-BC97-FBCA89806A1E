
/**
 * @name 导入dom
 */
const importDom = () => {

    // 导入空调信息 dom
    const air_conditioner_dom = createAirStateList(air_conditioner_data);
    $('#tab-air-conditioner>.set').before(air_conditioner_dom);

    
    // 导入新风信息 dom
    const fresh_air_dom = createAirStateList(fresh_air_data);
    $('#tab-fresh-air>.set').before(fresh_air_dom);
    
    
    // 导入房间列表 dom
    const room_list_dom = createRoomList(room_data);
    $('.select-wrap>.room-switch>.dropdown-menu').append(room_list_dom);

    return
}