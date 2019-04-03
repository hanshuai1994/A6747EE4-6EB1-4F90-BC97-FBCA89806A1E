$(function () {
    var animLoop = false;
    var idM;
    var camera, scene, renderer;
    var controls;
    var loader;
    var ambient, directional;

    const merge_builds = {
        north: undefined,
        middle: undefined,
        south: undefined,
    };


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


        let builds = {
            south: [],
            north: [],
            middle: [],
        }

        loader = new THREE.ObjectLoader();

        const paths = ['./models/north.js', './models/south.js', './models/tinglang.js'];
        // const paths = ['./models/zzz.js'];
        // const paths = [];

        let name_map = [];

        // 使用 promise 进行多个异步处理
        const promises = paths.map(function (path) {
            return new Promise(function (resolve, reject) {
                loader.load(path, function (object) {
                    console.log('object', object);

                    let objects = [];
                    if (object.name.includes("亭廊")) {
                        objects = builds.middle;
                    } else if (object.name.includes("北楼")) {
                        objects = builds.north;
                    } else if (object.name.includes("南楼")) {
                        objects = builds.south;
                    }

                    object.traverse(function (mesh) {
                        if (mesh instanceof THREE.Mesh) {
                            objects.push(mesh);
                        }
                    })

                    resolve();
                })
            })
        })

        Promise.all(promises).then(function (posts) {
            for (const key in builds) {
                if (builds.hasOwnProperty(key)) {
                    const objects = builds[key];
                    let mergeArray = merge_obj_children(objects);
                    scene.add(...mergeArray);

                    merge_builds[key] = mergeArray;
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
            // console.log(controls.object.position);

            controls.update();
            console.log(scene);

            // computeNormalsAndFaces();
            // THREEx.WindowResize(renderer, camera);

            $('#introContainer').fadeOut("slow", function () {
                render()
                $('#mainContainer').fadeIn("slow", function () {});
            });
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

    $('#container').on('click', '.state-box>.build-tab>span', function () {
        $(this).toggleClass('active');
        const mark = $(this).attr('data-mark');

        if (merge_builds[mark]) {
            for (const group of merge_builds[mark]) {
                group.visible = $(this).hasClass('active');
            }

            render();
        } 
    })
})