let Http;
const server = "aliyun_win";

switch (server) {
    case "localhost":
        Http = "http://localhost:8080/buildingManagement/"; //本地
        break;
    case "aliyun_win":
        Http = "http://121.40.174.117:8080/buildingManagement/"; //aliyun win
        break;
    default:
        break;
}

//新增运维数据
function addYunweiData(build, floor, room, title, time, state, content){
	$.ajax({
	    type: "POST",
	    url: Http + 'addYunweiData.do',
	    ansyc: false,
	    data: {build: build, floor: floor, room: room, title: title, time: time, state: state, content: content},
	    dataType: "json",
	    success: function(data) {
	        newId = eval(data);
	        console.log('新增运维数据的id', data[0].newId);
	    }
	})
}

//根据id删除对应运维数据
function deleteYunweiData(id){
	$.ajax({
	    type: "POST",
	    url: Http + 'deleteYunweiData.do',
	    ansyc: false,
	    data: {id: id},
	    dataType: "json",
	    success: function(data) {
	        resp = eval(data);
	        if(resp[0].data == 100){
	        	console.log("当前运维数据删除成功！");
	        }
	    }
	})
}

//根据id修改运维数据
function updateYunweiData(id, newBuild, newFloor, newRoom, newTitle, newTime, newState, newContent){
	$.ajax({
	    type: "POST",
	    url: Http + 'updateYunweiData.do',
	    ansyc: false,
	    data: {id: id, newBuild: newBuild, newFloor: newFloor, newRoom: newRoom, newTitle: newTitle, newTime: newTime, newState: newState, newContent: newContent},
	    dataType: "json",
	    success: function(data) {
	        resp = eval(data);
	        if(resp[0].data == 100){
	        	console.log("当前运维数据修改成功！");
	        }
	    }
	})
}

//查询所有运维数据
function selectAllYunweiData(){
	$.ajax({
	    type: "POST",
	    url: Http + 'selectAllYunweiData.do',
	    ansyc: false,
	    data: {},
	    dataType: "json",
	    success: function(data) {
	        resp = eval(data);
	        console.log('所有运维数据', resp);
	    }
	})
}