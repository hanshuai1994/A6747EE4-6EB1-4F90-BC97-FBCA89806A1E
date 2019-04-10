$(function () {
    // ======================= 插入 dom =======================
    importDom();

    // ======================= 触发函数 =======================
    // 选择一个房间时，dom 匹配
    const dom_room_select = (data) => {
        // const {
        //     build,
        //     floor,
        //     room
        // } = data;

        // 更新房间显示
        $('.select-wrap .room-switch').show();

        // 显示运维按钮
        $('.operate-btn').show();

        // 更新并显示空调与新风
        $('.air-system').show();
    }

    // 清空选择的房间时，dom 匹配
    const dom_room_clear = () => {
        // 隐藏房间显示
        $('.select-wrap .room-switch').hide();

        // 隐藏运维按钮
        $('.operate-btn').hide();

        // 隐藏空调与新风
        $('.air-system').hide();
    }

    // ======================= 绑定事件 =======================

    // 切换楼层按钮事件
    $('.select-wrap .floor-switch').on('click', '.dropdown-menu a', function () {
        const $floor_text = $('.select-wrap .floor-switch .floor-text');

        let index = $(this).attr('data-index');

        if (index == $floor_text.attr('data-index')) {
            return
        }

        $floor_text.attr('data-index', index);
        $floor_text.text($(this).text());

        dom_room_clear();

        if (index != 'all') {
            index = Number(index);
            $('.select-wrap .room-switch').show();
        }
    })

    // 房间切换按钮事件
    $('.select-wrap .room-switch').on('click', '.dropdown-menu a', function () {
        const $room_text = $('.select-wrap .room-switch .room-text');

        let index = $(this).attr('data-index');

        if (index == $room_text.attr('data-index')) {
            return
        }

        $room_text.attr('data-index', index);
        $room_text.text($(this).text());

        dom_room_select();
    })

    // 首页运维入口按钮事件
    $('#tab-home .operate-btn').click(function () {
        $('.operate-mask').show();
    })

    // 首页运维项目表单切换事件
    $('#tab-home .operate-wrap').on('click', '>.wrap-left>.content>.operate-item', function () {
        $(this).addClass('active').siblings().removeClass('active');
    })

    // 运维修改按钮
    $('#tab-home .operate-wrap .modify-btn').on('click', function () {
        $(this).parent().hide();

        $(this).parent().siblings('.edit-area').show();
    })

    // 首页运维界面关闭
    $('.operate-mask .operate-wrap .shut').click(function () {
        $('.operate-mask').hide();
    })

    // 隐藏空调/新风编辑框
    $(document).on('mouseup', function () {
        $('.air-edit').hide();
    })

    // 空调设置点击事件
    $('#tab-air-conditioner').on('click', '>.set', function () {
        $('.air-edit.air-conditioner').show();
    })

    // 阻止冒泡
    $('.air-edit').on('mouseup', function (e) {
        e.stopPropagation();
    })

    // 空调/新风编辑框关闭事件
    $('.air-edit').on('click', '.shut', function () {
        $(this).parents('.air-edit').hide();
    })

    // 新风设置点击事件
    $('#tab-fresh-air').on('click', '>.set', function () {
        $('.air-edit.fresh-air').show();
    })

    // ======================= 渲染逻辑 =======================
    var animLoop = false;
    var idM;
    var camera, scene, renderer;
    var controls;
    var ambient, directional;

    init();
    //animate();

    function init() {
        const container = document.querySelector('#container');
        const width = container.clientWidth,
            height = container.clientHeight;

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(width, height);
        renderer.localClippingEnabled = true;
        // renderer.logarithmicDepthBuffer = true;

        container.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(60, width / height, 1, 20000000);
        camera.position.set(-80000.0, 40000.0, 75000.0);

        ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);
        directional = new THREE.DirectionalLight(0xffffff, 0.1);
        directional.position.set(0, 1, 0);
        directional.castShadow = true;
        directional.shadow.mapSize.width = 2048;
        directional.shadow.mapSize.height = 2048;
        var d = 10000;
        directional.shadow.mapSize.left = -d;
        directional.shadow.mapSize.right = d;
        directional.shadow.mapSize.top = d * 2;
        directional.shadow.mapSize.bottom = -d * 2;
        directional.shadow.mapSize.near = 1000;
        directional.shadow.mapSize.far = 20000;
        scene.add(directional);

        mouse();

        // clip平面
        const clipPlanes = {
            '北楼': [
                new THREE.Plane(new THREE.Vector3(0, -1, 0), 50000), // 向下
                new THREE.Plane(new THREE.Vector3(0, 1, 0), 10000), // 向上
            ],
            '亭廊': [
                new THREE.Plane(new THREE.Vector3(0, -1, 0), 50000), // 向下
                new THREE.Plane(new THREE.Vector3(0, 1, 0), 10000), // 向上
            ],
            '南楼': [
                new THREE.Plane(new THREE.Vector3(0, -1, 0), 50000), // 向下
                new THREE.Plane(new THREE.Vector3(0, 1, 0), 10000), // 向上
            ],
        }


        const helpers = new THREE.Group();
        helpers.name = 'clip helpers'
        helpers.add(new THREE.AxesHelper(20));
        helpers.add(new THREE.PlaneHelper(clipPlanes['南楼'][0], 150000, 0xff0000));
        helpers.add(new THREE.PlaneHelper(clipPlanes['南楼'][1], 150000, 0x00ff00));
        helpers.visible = true;
        scene.add(helpers);

        // 待解析的 revit 文件路径数组
        const paths = ['./models/north.js', './models/south.js', './models/tinglang.js'];

        // 解析 revit 文件
        analysisRevit(paths, function (group) {
            scene.add(group);

            // merge 后的建筑组索引
            const merge_builds = {
                '北楼': undefined,
                '亭廊': undefined,
                '南楼': undefined,
            };

            // clipPlanes 高度对应索引
            const constant_map = {
                '北楼': [-0.45, 4.2, 7.8, 11.4, 15, 18.6, 22.2],
                '亭廊': [-0.45, 4.5, 7.8],
                '南楼': [-0.45, 3.82, 7.02, 10.22, 13.42, 16.62, 19.82, 23.02, 26.62],
            }

            // clip 材质索引
            const clip_material_map = {
                '北楼': [],
                '亭廊': [],
                '南楼': [],
            }


            // 遍历最外层 group, 获取三栋楼
            for (const child of group.children) {
                const key = child.name;
                merge_builds[key] = child;

                // 遍历每栋楼，获取 clip 组与楼层组
                for (const group of child.children) {
                    if (group.name == 'clip组') {

                        // 遍历 clip 组，获取融合 mesh 组与线框组
                        for (const clip_item of group.children) {

                            // 遍历融合 mesh 组与线框组，获取每个融合后的 mesh
                            for (const mesh of clip_item.children) {
                                const material = mesh.material;
                                material.clippingPlanes = clipPlanes[key];
                                material.clipIntersection = false;

                                clip_material_map[key].push(material);
                            }
                        }
                    }
                }
            }


            let box3 = new THREE.Box3().expandByObject(scene);

            controls.target = box3.getCenter(new THREE.Vector3());

            let diagonal = Math.sqrt(
                Math.pow(box3.max.x - box3.min.x, 2) +
                Math.pow(box3.max.y - box3.min.y, 2) +
                Math.pow(box3.max.z - box3.min.z, 2)
            );

            controls.object.position.set(controls.target.x - diagonal * 0.5, controls.target.y + diagonal * 0.5, controls.target.z + diagonal * 0.5);

            controls.update();
            console.log(scene);

            // computeNormalsAndFaces();
            // THREEx.WindowResize(renderer, camera);

            $('#introContainer').fadeOut("slow", function () {
                render()
                $('#mainContainer').fadeIn("slow", function () {});
            });

            // 绑定三栋楼的显示/隐藏按钮
            $('#container').on('click', '.state-box>.build-tab>span', function () {
                $(this).toggleClass('active');
                const key = $(this).attr('data-name');

                merge_builds[key].visible = $(this).hasClass('active');
                render();
            });

            // 绑定楼层切换按钮
            $('#container').on('click', '.floor-switch>span', function () {
                $(this).addClass('active').siblings().removeClass('active');
                let index = $(this).attr('data-index');

                // clearBSP(); // 清空 bsp

                for (const key in clipPlanes) {
                    const plane_array = clipPlanes[key];
                    if (index == 'all') {

                        // clip 划分
                        plane_array[0].constant = 50000; // 向下
                        plane_array[1].constant = 10000; // 向上

                        // 显示所有楼层
                        for (const child of merge_builds[key].children) {
                            if (child.name == '楼层组') {
                                for (const floor of child.children) {
                                    floor.visible = true;
                                }
                            }
                        }
                    } else {
                        index = Number(index);

                        // 进行 clip 位置调整
                        if (!constant_map[key][index - 1]) {
                            plane_array[0].constant = -10000 // 向下
                        } else {
                            const y_0 = constant_map[key][index] * 1000;
                            const y_1 = constant_map[key][index - 1] * 1000;

                            plane_array[0].constant = y_0 - 1 // 向下
                            plane_array[1].constant = -y_1 + 1 // 向上
                        }

                        console.log(key, plane_array);

                        // 遍历获取每栋楼的楼层组
                        for (const child of merge_builds[key].children) {
                            if (child.name == '楼层组') {

                                const floors = child.children;
                                for (const floor of floors) { // 遍历获取每层楼
                                    if (floor.name && floor.name == index + '楼') { // 显示目标楼层
                                        floor.visible = true;
                                    } else {
                                        if (key == '亭廊') { // 亭廊的一楼和二楼同时显示
                                            if ((index == 1 && floor.name == '2楼') || (index == 2 && floor.name == '1楼')) {
                                                floor.visible = true;
                                            } else {
                                                floor.visible = false;
                                            }
                                        } else { // 隐藏其他楼层
                                            floor.visible = false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                render();
            })
        })

        controls.addEventListener('change', function () {
            if (animLoop == false) {
                render();
            }
        });
    }

    function animate() {
        idM = requestAnimationFrame(animate);
        controls.update();
        render();
    }

    function render() {
        renderer.render(scene, camera);
        // console.log('renderer', renderer);
    }


    function mouse() {
        if (animLoop == true) {
            stopAnim(idM);
        }
        animLoop = false;
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = .75;
        controls.enableZoom = true;
    }

    function stopAnim(renderTarget) {
        cancelAnimationFrame(renderTarget);
    }
})