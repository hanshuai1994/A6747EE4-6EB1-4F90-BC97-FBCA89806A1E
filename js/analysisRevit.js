const getDividedFloor = (build, key) => {
    // 用于区分楼层的预设高度
    const preHeight = {
        '北楼': [-0.45, 4.2, 7.8, 11.4, 15, 18.6, 22.2],
        '亭廊': [-0.45, 4.5, 7.8],
        '南楼': [-0.45, 3.82, 7.02, 10.22, 13.42, 16.62, 19.82, 23.02, 26.62],
    }

    const result = new THREE.Group();
    result.name = key;

    // 将一栋楼的模型分为 clip 切割与 box 划分两个部分
    const objects = {
        clip: [],
        box: [],
        floor: [],
    }
    for (const obj3d of build.children) {
        let target = objects.box;

        // if (obj3d.userData.revit_id == 'addc58cd-5e25-4a28-96d8-7f33c4e689ad-0020d475') {
        //     console.log('obj3d', obj3d);
        // }

        if (
            obj3d.name.includes('2144203 北楼楼梯柱子') ||
            obj3d.name.includes('<2243475 柱 1>') ||
            obj3d.name.includes('<2144206 工业装配楼梯>') ||
            obj3d.name.includes('<2144249 1100 mm>') ||
            obj3d.name.includes('<2144245 1100 mm>') ||
            obj3d.name.includes('<2151541 ZJKJ_窗_MQ2>')
        ) {
            target = objects.clip;
        }

        for (const mesh of obj3d.children) {
            if (mesh instanceof THREE.Mesh) {
                target.push(...obj3d.children);
            }
        }
    }

    const build_heights = preHeight[key]; // 一栋楼的楼层高度数组

    outer:
        for (const mesh of objects.box) { // 遍历 box 组的所有 mesh
            const box3 = new THREE.Box3().expandByObject(mesh);
            const center = box3.getCenter(new THREE.Vector3());

            const length = build_heights.length;
            for (let i = 0; i < length - 1; i++) {
                if (!objects.floor[i]) {
                    objects.floor[i] = [];
                }

                const floor_height = build_heights[i] * 1000;
                const next_height = build_heights[i + 1] * 1000;

                if (center.y >= floor_height && center.y < next_height) {
                    objects.floor[i].push(mesh);
                    continue outer;
                }
            }

            if (!objects.floor[length - 1]) {
                objects.floor[length - 1] = [];
            }
            objects.floor[length - 1].push(mesh);
        }


    const floor_group = new THREE.Group();
    floor_group.name = '楼层组';
    result.add(floor_group);

    for (let i = 0; i < objects.floor.length; i++) {
        const floor = merge_obj_children(objects.floor[i]);
        floor.name = i + 1 + '楼';

        floor_group.add(floor);
    }

    const clip_group = merge_obj_children(objects.clip);
    clip_group.name = 'clip组';
    result.add(clip_group);

    return result
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

        for (const build of builds) { // 对每栋楼进行处理
            let key = '北楼';
            if (build.name.includes("亭廊")) {
                key = "亭廊";
            } else if (build.name.includes("南楼")) {
                key = "南楼";
            }

            const result = getDividedFloor(build, key)

            group.add(result);

            console.log(key, result);
        }

        callback(group);
    })
}