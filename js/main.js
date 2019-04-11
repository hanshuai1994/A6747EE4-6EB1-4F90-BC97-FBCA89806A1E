$(function () {
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

    // 选择运维单项时
    const dom_oper_select = (element) => {
        const id = Number($(element).attr('data-id'));

        const $wrap_left = $(element).parents('.wrap-left');
        const $wrap_right = $wrap_left.siblings('.wrap-right');

        const $view_area = $wrap_right.find('.view-area');
        const $edit_area = $wrap_right.find('.edit-area');

        $view_area.show();
        $edit_area.hide();

        $(element).addClass('active').siblings().removeClass('active');

        let this_data;
        for (const data of home_oper_data) {
            if (data.id == id) {
                this_data = data;
                dom_update_oper_view($view_area, this_data);
                break;
            }
        }
    }

    // 更新运维展示界面信息
    const dom_update_oper_view = ($view_area, data) => {
        const {
            title,
            time,
            state,
            content
        } = data

        $view_area.find('>.title>.text').text(title); // 更新标题
        $view_area.find('>.time>.text').text(time); // 更新时间
        $view_area.find(`>.state>.text`).attr('data-state', state); // 更新状态
        $view_area.find('>.content>textarea').val(content); // 更新内容
    }

    // 获取运维编辑界面信息
    const get_oper_edit_data = ($edit_area) => {
        const title = $edit_area.find('>.title>input').val();
        // const time = $edit_area.find('>.time>.calendar').val(); 
        const state = $edit_area.find('>.state>.radio-box>span.selected').attr('date-state');
        const content = $edit_area.find('>.content>textarea').val();

        return {
            title,
            // time,
            state,
            content,
        }
    }

    // 更新运维编辑界面信息
    const update_oper_edit_dom = ($edit_area, data) => {
        const {
            title,
            time,
            state,
            content
        } = data

        $edit_area.find('>.title>input').val(title); // 更新标题
        // 清空时间/设置为当前时间
        $edit_area.find(`>.state>.radio-box>span[data-state=${state}]`).addClass('selected').siblings().removeClass('selected'); // 更新状态
        $edit_area.find('>.content>textarea').val(content); // 更新内容
    }

    // ======================= 插入 dom =======================
    importDom();

    // 切换显示首页第一个运维项目
    const home_first_oper_item = $('#tab-home .operate-wrap .wrap-left>.content').children()[0];
    dom_oper_select(home_first_oper_item);

    // 切换显示管理页第一个运维项目
    const manage_first_oper_item = $('#tab-manage .operate-wrap .wrap-left>.content').children()[0];
    dom_oper_select(manage_first_oper_item);



    // ======================= 绑定事件 =======================
    // +++++++++++++++++++++++ 首页与运维共用事件 +++++++++++++++++++++++
    // 运维项目表单切换事件
    $('.operate-wrap').on('click', '>.wrap-left>.content>.operate-item', function () {
        dom_oper_select(this);
    });

    // 运维修改按钮
    $('.operate-wrap .modify-btn').on('click', function () {
        const $wrap_right = $(this).parents('.wrap-right');
        const $wrap_left = $wrap_right.siblings('.wrap-left');

        const $view_area = $wrap_right.find('.view-area');
        const $edit_area = $wrap_right.find('.edit-area');

        $view_area.hide();
        $edit_area.show();

        const id = Number($wrap_left.find('>.content>.operate-item.active').attr('data-id'));

        let this_data;
        for (const data of home_oper_data) {
            if (data.id == id) {
                this_data = data;
                update_oper_edit_dom($edit_area, this_data);
                break;
            }
        }
    });

    // 修改界面状态切换
    $('.operate-wrap .wrap-right').on('click', '.edit-area .state>.radio-box>span', function () {
        $(this).addClass('selected').siblings().removeClass('selected');
    });

    // 修改界面保存/取消按钮
    $('.operate-wrap .wrap-right').on('click', '.edit-area .btn-box>span', function () {
        const $edit_area = $(this).parents('.edit-area');
        const $view_area = $edit_area.siblings('.view-area');

        $view_area.show();
        $edit_area.hide();

        if ($(this).hasClass('save')) {
            const data = get_oper_edit_data($edit_area);
        }
    });

    // 新建按钮
    $('.operate-wrap .wrap-left').on('click', '.bottom-area>.add-btn', function () {
        // 左侧添加新建条目
        const newData = {
            title: '新建',
            time: '',
            state: 'unfinished',
            content: '',
        };

        const newDom = createHomeOperItem(newData);

        const $wrap_left = $(this).parents('.wrap-left');
        const $wrap_right = $wrap_left.siblings('.wrap-right');

        const $content = $wrap_left.find('>.content');
        $content.prepend(newDom);
        $content.children().removeClass('active');
        $content.children(':first-child').addClass('active');

        // 右侧打开编辑区域
        const $view_area = $wrap_right.find('.view-area');
        const $edit_area = $wrap_right.find('.edit-area');

        $view_area.hide();
        $edit_area.show();

        // 初始化编辑区域
        update_oper_edit_dom($edit_area, {
            title: '',
            time: '',
            state: 'unfinished',
            content: '',
        });
    })

    // +++++++++++++++++++++++ 首页页面事件 +++++++++++++++++++++++
    // ----------------------- 左侧切换事件 -----------------------
    // 楼栋显示/隐藏按钮
    $('#tab-home .select-wrap .build-tab>span').on('click', function () {
        $(this).toggleClass('active');
    })

    // 切换楼层按钮事件
    $('#tab-home .select-wrap .floor-switch').on('click', '.dropdown-menu a', function () {
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

            if ($('#tab-home .select-wrap .build-tab>span.active').length == 1) {
                $('.select-wrap .room-switch').show();
            }
        }
    })

    // 房间切换按钮事件
    $('#tab-home .select-wrap .room-switch').on('click', '.dropdown-menu a', function () {
        const $room_text = $('.select-wrap .room-switch .room-text');

        let index = $(this).attr('data-index');

        if (index == $room_text.attr('data-index')) {
            return
        }

        $room_text.attr('data-index', index);
        $room_text.text($(this).text());

        dom_room_select();
    })

    // ----------------------- 首页运维事件 -----------------------
    // 首页运维入口按钮事件
    $('#tab-home .operate-btn').click(function () {
        $('.operate-mask').show();
    })

    // 首页运维界面关闭
    $('#tab-home .operate-wrap .shut').click(function () {
        $('#tab-home .operate-mask').hide();
    });

    // ----------------------- 空调新风 -----------------------
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

    // 空调/新风编辑框内状态修改
    $('.air-edit .set-state>.attr-set').click(function () {
        const state = $(this).attr('data-state');

        let newState;

        if (state == 'off') {
            newState = 'on';
        } else {
            newState = 'off';
        }

        $(this).attr('data-state', newState);
        $(this).text(newState);
    })

    // +++++++++++++++++++++++ 管理页面 +++++++++++++++++++++++
    // ----------------------- 上部切换 -----------------------
    $('#tab-manage>.operate-menu>.build-tab>span').click(function () {
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings().removeClass('active');
        }
    })

    // ----------------------- 运维列表项切换 -----------------------
    $('#tab-manage>.operate-wrap>.wrap-left>.content').on('click', '>.operate-item', function () {
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings().removeClass('active');
        }
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