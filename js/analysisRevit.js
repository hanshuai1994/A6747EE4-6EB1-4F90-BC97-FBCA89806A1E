const getDividedFloor = (build, key) => {
    // 用于区分楼层的预设高度
    const preHeight = {
        middle: [-0.45, 4.5, 7.8],
        north: [-0.45, 4.2, 7.8, 11.4, 15, 18.6, 22.2],
        south: [-0.45, 3.82, 7.02, 10.22, 13.42, 16.62, 19.82, 23.02, 26.62]
    }

    const floors = [];

    for (const obj3d of build.children) {
        const box3 = new THREE.Box3().expandByObject(obj3d);
        const center = box3.getCenter(new THREE.Vector3());

        const y_m = center.y / 1000; // 将中心点转化为米的单位

        let index = preHeight[key].length; // 楼层数

        while (index--) {
            if (y_m >= preHeight[key][index]) {
                if (floors[index]) {
                    floors[index].push(obj3d);
                } else {
                    floors[index] = [obj3d];
                }
                break
            }
        }
    }

    return floors
}


const analysisRevit = (paths, callback) => {
    let builds = [];

    const loader = new THREE.ObjectLoader();

    // 使用 promise 进行多个异步处理
    const promises = paths.map(function (path) {
        return new Promise(function (resolve, reject) {
            loader.load(path, function (object) {
                builds.push(object);
                resolve();
            })
        })
    })

    // 异步全部结束后对获取的楼进行处理
    Promise.all(promises).then(function (posts) {
        const group = new THREE.Group();
        group.name = '模型整体';

        for (const build of builds) {
            // 区分楼幢
            const objects = [];
            build.traverse(function(obj) {
                if (obj instanceof THREE.Mesh) {
                    objects.push(obj);
                }
            })

            const result = merge_obj_children(objects);

            if (build.name.includes("亭廊")) {
                result.name = "亭廊";
            } else if (build.name.includes("北楼")) {
                result.name = "北楼";
            } else if (build.name.includes("南楼")) {
                result.name = "南楼";
            }

            group.add(result);
        }

        callback(group);
    })
}