$(function () {
    // ####################### 定义 #######################
    // ======================= 定义变量 =======================
    var camera, scene, renderer;
    var controls;
    var ambient, directional;
    let container;

    let mousedown_point;
    let mouseup_point;

    const raycaster = new THREE.Raycaster(); //射线
    const mouse = new THREE.Vector2(); //鼠标位置

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

    // ======================= 触发函数 =======================
    // 创建房间地面的 mesh
    const createRoomMesh = (roomData) => {
        const result = [];

        const {
            roomName,
            roomPoints,
            buildName,
            floorIndex,
        } = roomData;

        const scale = 304.8;

        for (const array of roomPoints) {
            const shape = new THREE.Shape();
            const length = array.length;

            for (let i = 0; i < length; i++) {
                const point = array[i];

                if (i == 0) {
                    shape.moveTo(point.X * scale, point.Y * scale);
                } else {
                    shape.lineTo(point.X * scale, point.Y * scale)
                }

            }
            const firstPoint = array[0];
            shape.lineTo(firstPoint.X * scale, firstPoint.Y * scale);

            const material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                side: THREE.DoubleSide
            });
            const geometry = new THREE.ShapeGeometry(shape);

            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = Math.PI / 2;
            mesh.rotation.y = Math.PI;

            mesh.position.y = firstPoint.Z * scale;

            mesh.name = '房间';
            mesh.roomName = roomName;
            mesh.buildName = buildName;
            mesh.floorIndex = floorIndex;

            result.push(mesh);
        }

        return result
    }
    // 初始化 clip 的 constant 值
    const initClipConstant = (plane_array, build) => {
        // clip 划分
        plane_array[0].constant = 50000; // 向下
        plane_array[1].constant = 10000; // 向上

        // 显示所有楼层
        for (const child of build.children) {
            if (child.name == '楼层组') {
                for (const floor of child.children) {
                    floor.visible = true;
                }
            }
        }
    }

    // 根据传入参数设置控制器位置
    const setControlsByFloor = (controls, target) => {
        let center = new THREE.Vector3();

        if (Array.isArray(target)) { // 存在多个楼栋时
            let x = y = z = count = 0;

            for (const group of target) {
                const box3 = new THREE.Box3();
                box3.expandByObject(group);
                const _center = box3.getCenter(new THREE.Vector3());

                x += _center.x;
                y += _center.y;
                z += _center.z;

                count++
            }

            center.x = x / count;
            center.y = y / count;
            center.z = z / count;
        } else {
            const box3 = new THREE.Box3();
            box3.expandByObject(target);
            center = box3.getCenter(center);
        }

        controls.object.position.y = center.y;
        controls.target.copy(center);
        controls.update();
    }

    // 选择一个房间时，dom 匹配
    const dom_room_select = (data) => {
        const {
            buildName,
            floorIndex,
            roomName
        } = data;

        const $build_tab = $('#container>.select-wrap>.build-tab');
        const $floor_switch = $build_tab.siblings('.floor-switch');
        const $room_switch = $build_tab.siblings('.room-switch');

        // 切换楼栋dom显示
        const $other_build = $build_tab.find(`>span[data-name=${buildName}]`).siblings();
        for (const build of $other_build) {
            const buildName = $(build).attr('data-name');
            merge_builds[buildName].visible = false;
            $(build).removeClass('active');
        }

        // 更新房间显示与下拉菜单
        $('.select-wrap .room-switch').show();
        update_home_floor_dom();
        $floor_switch.find('>.floor-text').text(floorIndex + 1 + '楼').attr('data-index', floorIndex);

        // 更新房间显示与下拉菜单
        show_home_room_dom();
        $room_switch.find('>.room-text').text(roomName + '室').attr('data-index', roomName);

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

    // 更新首页楼层选择下拉菜单
    const update_home_floor_dom = () => {
        const $build_tab = $('#container>.select-wrap>.build-tab');
        const $floor_switch = $build_tab.siblings('.floor-switch');

        const $active_build = $build_tab.find('>span.active');

        let floors = [];

        if ($active_build.length == 1) {
            const active_build_name = $active_build.attr('data-name');
            floors = build_data[active_build_name];
        }

        const firstData = {
            index: 'all',
            floorName: '全景'
        }
        const floors_dom = createFloorList(floors, firstData);

        $floor_switch.find('>.floor-text').text(firstData.floorName).attr('data-index', firstData.index);
        $floor_switch.find('>.dropdown-menu').html(floors_dom);

    }

    // 更新首页房间选择下拉菜单
    const update_home_room_dom = ($build_tab, $floor_switch, $room_switch) => {
        const $active_build = $build_tab.find('>span.active');

        const active_build_name = $active_build.attr('data-name');
        const active_floor_index = $floor_switch.find('>.floor-text').attr('data-index');
        const active_floors = build_data[active_build_name];

        const rooms = active_floors[active_floor_index].rooms;

        const rooms_dom = createRoomList(rooms, true, '室');
        $room_switch.find('>.room-text').text('所有房间').attr('data-index', 'all');
        $room_switch.find('>.dropdown-menu').html(rooms_dom);
    }

    // 显示首页房间选择下拉菜单
    const show_home_room_dom = () => {
        const $build_tab = $('#container>.select-wrap>.build-tab');
        const $floor_switch = $build_tab.siblings('.floor-switch');
        const $room_switch = $build_tab.siblings('.room-switch');

        // 更新下拉菜单
        update_home_room_dom($build_tab, $floor_switch, $room_switch);

        // 下拉菜单显示
        $room_switch.show();
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

    // 管理页切换楼栋
    const manage_switch_build = (element) => {
        const build_name = $(element).attr('data-name');
        const floors = build_data[build_name];

        // 楼层下拉列表更新 ----------------------
        const firstData = {
            index: 'all',
            floorName: '所有楼层'
        }
        const floors_dom = createFloorList(floors, firstData);

        const $floor_switch = $(element).parent().siblings('.floor-switch');

        $floor_switch.find('>.floor-text').text(firstData.floorName).attr('data-index', firstData.index);
        $floor_switch.find('>.dropdown-menu').html(floors_dom);

        // 房间下拉列表更新 ----------------------
        const $room_switch = $floor_switch.siblings('.room-switch');

        const rooms = [];
        for (const floor of floors) {
            rooms.push(...floor.rooms);
        }
        const rooms_dom = createRoomList(rooms, true, '室');
        $room_switch.find('>.room-text').text('所有房间').attr('data-index', 'all');
        $room_switch.find('>.dropdown-menu').html(rooms_dom);
    }

    // 管理页切换楼层
    const manage_switch_floor = (element) => {
        const $floor_switch = $(element).parents('.floor-switch');
        const $build_tab = $floor_switch.siblings('.build-tab');
        const $room_switch = $floor_switch.siblings('.room-switch');

        const $active_build = $build_tab.find('>span.active');
        const build_name = $active_build.attr('data-name');

        const active_floors = build_data[build_name];
        const active_floor_index = $(element).attr('data-index');

        const rooms = [];
        if (active_floor_index == 'all') {
            for (const floor of active_floors) {
                rooms.push(...floor.rooms);
            }
        } else {
            rooms.push(...active_floors[active_floor_index].rooms);
        }

        const rooms_dom = createRoomList(rooms, true, '室');
        $room_switch.find('>.room-text').text('所有房间').attr('data-index', 'all');
        $room_switch.find('>.dropdown-menu').html(rooms_dom);
    }


    // ####################### 运行 #######################
    document.oncontextmenu = function () {
        return false;
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
    // +++++++++++++++++++++++ 运维共用事件 +++++++++++++++++++++++
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

        // 更新编辑页的楼层选择下拉菜单
        const $floor_switch = $edit_area.find('>.room>.room-area .floor-switch');
        if ($floor_switch.length > 0) {
            const active_build_name = $('#tab-manage>.operate-menu>.build-tab>span.active').attr('data-name');
            const floors = build_data[active_build_name];

            const floors_dom = createFloorList(floors);
            $floor_switch.find('>.dropdown-menu').html(floors_dom);
        }

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
        } else {
            const $wrap_right = $edit_area.parent();
            const $wrap_left = $wrap_right.siblings('.wrap-left');
            const $active_item = $wrap_left.find('>.content>.operate-item.active');

            const active_id = $active_item.attr('data-id');
            if (active_id == 'new') {
                const other_first_item = $active_item.siblings()[0];
                dom_oper_select(other_first_item);
                $active_item.remove();
            }
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

        const newDom = createOperItem(newData);

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

    // 空调/新风的模式/风速修改
    $('.air-edit .set-mode>.attr-set>.dropdown-menu, .air-edit .set-cloud>.attr-set>.dropdown-menu').on('click', '>li>a', function () {
        const text = $(this).text();

        const $btn_menu = $(this).parents('.dropdown-menu').siblings('.btn-menu');
        $btn_menu.text(text);
    })

    // 空调/新风控制修改的确定按钮
    $('.air-edit>.content-box>.ensure').click(function () {
        $(this).parents('.air-edit').hide();
    })

    // +++++++++++++++++++++++ 管理页面 +++++++++++++++++++++++
    // ----------------------- 上部切换 -----------------------
    // 楼栋切换
    $('#tab-manage>.operate-menu>.build-tab>span').click(function () {
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings().removeClass('active');
            manage_switch_build(this);
        }
    })

    // 楼层切换
    $('#tab-manage>.operate-menu>.floor-switch>.dropdown-menu').on('click', '>li>a', function () {
        const $floor_switch = $(this).parents('.floor-switch');
        const $floor_text = $floor_switch.find('>.floor-text');

        const active_index = $floor_text.attr('data-index');
        const this_index = $(this).attr('data-index');

        if (active_index != this_index) {
            manage_switch_floor(this);
            $floor_text.attr('data-index', this_index);
            $floor_text.text($(this).text());
        }
    })

    // 房间切换
    $('#tab-manage>.operate-menu>.room-switch>.dropdown-menu').on('click', '>li>a', function () {
        const $room_switch = $(this).parents('.room-switch');
        const $room_text = $room_switch.find('>.room-text');

        const active_index = $room_text.attr('data-index');
        const this_index = $(this).attr('data-index');

        if (active_index != this_index) {
            // manage_switch_floor(this);
            $room_text.attr('data-index', this_index);
            $room_text.text($(this).text());
        }
    })

    // 编辑界面的楼层切换
    $('#tab-manage>.operate-wrap>.wrap-right>.edit-area>.room>.room-area .floor-switch>.dropdown-menu').on('click', '>li>a', function () {
        let index = $(this).attr('data-index');

        const $floor_text = $(this).parents('.floor-switch').find('>.floor-text');

        $floor_text.attr('data-index', index);
        $floor_text.text($(this).text());

        // 更新房间选择下拉菜单
        const $room_switch = $(this).parents('.floor-box').siblings('.room-box').find('>.room-switch')
        const active_build_name = $('#tab-manage>.operate-menu>.build-tab>span.active').attr('data-name');
        const active_floors = build_data[active_build_name];
        const rooms = active_floors[index].rooms;

        const rooms_dom = createRoomList(rooms, false, '');
        $room_switch.find('>.room-text').text('请选择');
        $room_switch.find('>.room-text').attr('data-index', 'none');
        $room_switch.find('>.dropdown-menu').html(rooms_dom);
    })

    // 编辑界面的房间切换
    $('#tab-manage>.operate-wrap>.wrap-right>.edit-area>.room>.room-area .room-switch>.dropdown-menu').on('click', '>li>a', function () {
        const $room_switch = $(this).parents('.room-switch');
        const $room_text = $room_switch.find('>.room-text');

        const active_index = $room_text.attr('data-index');
        const this_index = $(this).attr('data-index');

        if (active_index != this_index) {
            // manage_switch_floor(this);
            $room_text.attr('data-index', this_index);
            $room_text.text($(this).text());
        }
    })

    // ----------------------- 运维列表项切换 -----------------------
    $('#tab-manage>.operate-wrap>.wrap-left>.content').on('click', '>.operate-item', function () {
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings().removeClass('active');
        }
    })


    // ======================= 渲染逻辑 =======================
    init();
    animate();

    function animate() {
        idM = requestAnimationFrame(animate);
        TWEEN.update();
        controls.update();
        render();
    }

    function render() {
        renderer.render(scene, camera);
        // console.log('renderer', renderer);
    }

    //获得射线扫描到对象
    function getRaycaster(event) {
        mouse.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        return raycaster;
    }

    function init() {
        container = document.querySelector('#container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        // console.log('height', height);

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

        controls = new THREE.OrbitControls(camera, renderer.domElement);

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
        // scene.add(helpers);

        // 待解析的 revit 文件路径数组
        // const paths = ['./models/land.js'];
        const paths = [
            './models/north.js',
            './models/south.js',
            './models/tinglang.js',
            './models/land.js',
        ];

        // 解析 revit 文件
        analysisRevit(paths, function (group) {
            scene.add(group);

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
            $('#container').on('click', '.select-wrap>.build-tab>span', function () {
                $(this).toggleClass('active');
                const key = $(this).attr('data-name');

                const $build_tab = $(this).parent();
                const $floor_switch = $build_tab.siblings('.floor-switch');

                const $active_build = $build_tab.find('>span.active');

                const active_floor_index = $floor_switch.find('>.floor-text').attr('data-index');

                update_home_floor_dom(); // 更新楼层切换下拉菜单

                if ($active_build.length == 1 && active_floor_index != 'all') {
                    show_home_room_dom(); // 出现房间选择下拉界面
                } else {
                    dom_room_clear(); // 收起房间下拉等多个界面
                    for (const key in clipPlanes) {
                        if (clipPlanes.hasOwnProperty(key)) {
                            const plane_array = clipPlanes[key];
                            initClipConstant(plane_array, merge_builds[key]);
                        }
                    }
                }

                if ($active_build.length > 0) {
                    const target = [];
                    for (const active_build of $active_build) {
                        const active_build_name = $(active_build).attr('data-name');
                        const build = merge_builds[active_build_name];
                        target.push(build);
                    }
                    setControlsByFloor(controls, target);
                }

                merge_builds[key].visible = $(this).hasClass('active');
            });

            // 绑定楼层切换按钮
            $('#container>.select-wrap>.floor-switch>.dropdown-menu').on('click', '>li>a', function () {
                // $(this).addClass('active').siblings().removeClass('active');
                let index = $(this).attr('data-index');

                const $floor_text = $(this).parents('.floor-switch').find('>.floor-text');

                $floor_text.attr('data-index', index);
                $floor_text.text($(this).text());

                dom_room_clear();

                const $active_build = $('#tab-home .select-wrap .build-tab>span.active');

                if ($active_build.length == 1) {
                    const active_build_name = $active_build.attr('data-name');
                    const build = merge_builds[active_build_name];
                    const plane_array = clipPlanes[active_build_name];

                    if (index == 'all') {
                        initClipConstant(plane_array, build);
                        setControlsByFloor(controls, build);
                    } else {
                        index = Number(index);

                        if ($active_build.length == 1) {
                            show_home_room_dom(); // 出现房间选择下拉界面
                        }

                        // 进行 clip 位置调整
                        const build_constant = constant_map[active_build_name];
                        if (!build_constant[index]) {
                            plane_array[0].constant = -10000 // 向下
                        } else {
                            const y_0 = build_constant[index + 1] * 1000;
                            const y_1 = build_constant[index] * 1000;

                            plane_array[0].constant = y_0 - 1 // 向下
                            plane_array[1].constant = -y_1 + 1 // 向上
                        }

                        // console.log(key, plane_array);

                        const floor_index = index + 1;
                        // 遍历获取每栋楼的楼层组
                        for (const child of build.children) {
                            if (child.name == '楼层组') {

                                const floors = child.children;
                                for (const floor of floors) { // 遍历获取每层楼
                                    if (floor.name && floor.name == floor_index + '楼') { // 显示目标楼层
                                        floor.visible = true;
                                        setControlsByFloor(controls, floor);
                                    } else {
                                        if (active_build_name == '亭廊') { // 亭廊的一楼和二楼同时显示
                                            if ((floor_index == 1 && floor.name == '2楼') || (floor_index == 2 && floor.name == '1楼')) {
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
            })
        })

        // 解析房间信息
        $.getJSON('/js/data/roomName.js', function (data) {
            // console.log('data', data);
            const roomGroup = new THREE.Group();
            roomGroup.name = '房间地面组';
            roomGroup.visible = false;
            scene.add(roomGroup);

            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const roomPoints = data[key];

                    const build_room = key.split(' ')[1];
                    const split_arr = build_room.split('-');

                    if (split_arr.length == 2 && split_arr[1] != '') { // 既有楼栋，又有房间名时

                        // 过滤掉空数组
                        const newPoints = roomPoints.filter(function (roomPoint) {
                            return roomPoint.length > 0
                        })

                        // 当没有有效房间点位时，进入下一轮循环
                        if (newPoints.length == 0) {
                            continue
                        }

                        const build_mark = split_arr[0]; // 值为大写的英文字母
                        const room_name = split_arr[1]; // 值为房间号字符串

                        // 房间后首位数字减 1
                        const index = Number(room_name.slice(0, 1)) - 1;

                        let build_name;
                        if (build_mark == 'N') {
                            build_name = '北楼';
                        } else if (build_mark == 'S') {
                            build_name = '南楼';
                        } else {
                            build_name = '亭廊';
                        }

                        // 一个房间的数据
                        const roomData = {
                            buildName: build_name,
                            floorIndex: index,
                            roomName: room_name,
                            roomPoints: newPoints
                        };

                        // 向变量放入数据
                        let build = build_data[build_name];
                        if (!build[index]) { // 未有该楼层
                            build[index] = {
                                floorName: `${index + 1}楼`,
                                rooms: [roomData],
                            }
                        } else { // 已有该楼层
                            build[index].rooms.push(roomData);
                        }

                        // 向场景中添加房间地板的mesh
                        const meshs = createRoomMesh(roomData);
                        for (const mesh of meshs) {
                            roomGroup.add(mesh);
                        }
                    }
                }
            }

            // 触发一次运维页的楼栋切换
            const manage_first_build_tab = $('#tab-manage .operate-menu .build-tab').children()[0];
            manage_switch_build(manage_first_build_tab);

            console.log('build_data', build_data);

            // 添加房间选择的射线函数绑定
            $(container).on('mousedown', '>canvas', function (event) {
                const raycaster = getRaycaster(event);
                const intersects = raycaster.intersectObjects(roomGroup.children);

                if (intersects.length > 0) {
                    mousedown_point = intersects[0].point;
                }
            })

            $(container).on('mouseup', '>canvas', function (event) {
                if (!mousedown_point) {
                    return
                }

                const raycaster = getRaycaster(event);
                const intersects = raycaster.intersectObjects(roomGroup.children);

                if (intersects.length > 0) {
                    const mouseup_point = intersects[0].point;
                    const mesh = intersects[0].object;

                    if (mouseup_point.distanceTo(mousedown_point) > 5) {
                        mousedown_point = undefined;
                        mouseup_point = undefined;
                        return
                    }

                    const object = intersects[0].object;

                    console.log('room', object.buildName, object.floorIndex, object.roomName);
                    const roomData = {
                        buildName: object.buildName,
                        floorIndex: object.floorIndex,
                        roomName: object.roomName
                    }

                    // dom 匹配所选房间
                    dom_room_select(roomData);

                    const position = controls.object.position;
                    const target = controls.target;

                    const new_position = mouseup_point.clone();
                    new_position.y += 1500;

                    // 计算相机位置指向target的方向
                    const direction = new THREE.Vector3();
                    direction.x = target.x - position.x;
                    direction.y = target.y - position.y;
                    direction.z = target.z - position.z;
                    direction.normalize();

                    const offset = 100;

                    const new_target = {
                        x: direction.x * offset + new_position.x,
                        y: direction.y * offset + new_position.y,
                        z: direction.z * offset + new_position.z,
                    }

                    // 更新相机位置
                    const tween_p = new TWEEN.Tween(position);
                    tween_p.to(new_position, 2000).start();

                    const tween_t = new TWEEN.Tween(target);
                    tween_t.to(new_target, 2000).start();
                }
            })
        })

        // controls.addEventListener('change', function () {
        //     if (animLoop == false) {
        //         render();
        //     }
        // });
    }

    // function mouse() {
    //     if (animLoop == true) {
    //         stopAnim(idM);
    //     }
    //     animLoop = false;
    //     controls = new THREE.OrbitControls(camera, renderer.domElement);
    //     controls.enableDamping = true;
    //     controls.dampingFactor = .75;
    //     controls.enableZoom = true;
    // }

    // function stopAnim(renderTarget) {
    //     cancelAnimationFrame(renderTarget);
    // }
})