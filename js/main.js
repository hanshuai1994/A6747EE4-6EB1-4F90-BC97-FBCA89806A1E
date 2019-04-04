$(function () {
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

        const plane_geometry = new THREE.PlaneGeometry(50000, 50000, 1, 1);
        const plane_material = new THREE.MeshBasicMaterial();
        const plane_cut = new THREE.Mesh(plane_geometry, plane_material);

        var helpers = new THREE.Group();
        helpers.add(new THREE.AxesHelper(20));
        helpers.add(new THREE.PlaneHelper(clipPlanes['南楼'][0], 30000, 0xff0000));
        helpers.add(new THREE.PlaneHelper(clipPlanes['南楼'][1], 30000, 0x00ff00));
        helpers.visible = true;
        scene.add(helpers);

        const paths = ['./models/north.js', './models/south.js', './models/tinglang.js'];

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

            // 材质索引
            const material_map = {
                '北楼': [],
                '亭廊': [],
                '南楼': [],
            }

            // 遍历最外层 group 的 children, 获取三栋楼
            for (const child of group.children) {
                const key = child.name;

                merge_builds[key] = child;

                // 遍历三栋楼的 children, 获取 mesh组 和 线框组
                for (const group of child.children) {

                    // 遍历 mesh组 和 线框组, 获取mesh
                    for (const mesh of group.children) {
                        const material = mesh.material;
                        if (!material_map[key].includes(material)) {
                            material.clippingPlanes = clipPlanes[key];
                            material.clipIntersection = false;
                            material_map[key].push(material);
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

                for (const key in clipPlanes) {
                    const plane_array = clipPlanes[key];
                    if (index == 'all') {
                        plane_array[0].constant = 50000; // 向下
                        plane_array[1].constant = 10000; // 向上
                    } else {
                        index = Number(index);
                        if (!constant_map[key][index - 1]) {
                            plane_array[0].constant = -10000 // 向下
                        } else {
                            plane_array[0].constant = constant_map[key][index] * 1000 - 1 // 向下
                            plane_array[1].constant = -constant_map[key][index - 1] * 1000 + 1 // 向上
                        }
                    }

                    if (key == '北楼') {
                        console.log('plane_array[0]', plane_array[0]);
                        console.log('plane_array[1]', plane_array[1]);
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
        console.log('renderer', renderer);
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