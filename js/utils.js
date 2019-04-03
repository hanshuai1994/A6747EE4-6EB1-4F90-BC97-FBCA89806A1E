// 融合材质
function merge_obj_children(array) { //merge外部导入模型的同材质到一个数组
    var material_array = [];
    var geometry_array = [];

    for (const object of array) { // 遍历所有object
        const geometry = object.geometry;
        const material = object.material;

        var index = material_array.indexOf(material); // 进行一次基于指针的存在判断
        if (index == -1) {
            material_array.push(material);
            geometry_array.push([new THREE.BufferGeometry().fromGeometry(geometry)]);
        } else { // 已经出现过的材质
            geometry_array[index].push(new THREE.BufferGeometry().fromGeometry(geometry));
        }
    }


    //开始进行合并
    for (var i = 0; i < geometry_array.length; i++) {
        geometry_array[i] = THREE.BufferGeometryUtils.mergeBufferGeometries(geometry_array[i]);
    }

    //合并完成，进行分组
    var group = new THREE.Group();
    var group1 = new THREE.Group();
    for (var i = 0; i < geometry_array.length; i++) {
        var obj = new THREE.Mesh(geometry_array[i], material_array[i]);
        var geo = new THREE.EdgesGeometry(geometry_array[i], 30); // or WireframeGeometry( geometry )
        var mat = new THREE.LineBasicMaterial({
            color: 0x0d0d0d,
            transparent: true,
            opacity: 0.3
        });
        var wireframe = new THREE.LineSegments(geo, mat);
        group.add(obj);
        group1.add(wireframe);

    }

    return [group, group1];
}