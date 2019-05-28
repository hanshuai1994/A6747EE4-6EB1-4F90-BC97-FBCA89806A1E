// import * as THREE from "three";
import FBXLoader from '../loaders/FBXLoader';

// 
const analysisFBX = (paths, builds_map, callback) => {
    const loader = new FBXLoader();
    const promises = [];

    let total = 0;
    let loaded_map = {};

    let length = paths.length;
    for (let i = 0; i < length; i++) {
        const path = paths[i];
        const key = path.substr(9, 2);
        const promise = new Promise(function (resolve, reject) {
            loader.load(
                path,
                function (object) { // onLoad
                    builds_map[key].add(object);
                    resolve(object);
                },
                (xhr) => { // onProgress
                    // const loaded_keys = Object.keys(loaded_map);

                    // loaded_map[path] = xhr.loaded;
                    // if (loaded_keys.length == length) { // 全部含有数据时
                    //     let loaded_all = 0;

                    //     for (const key of loaded_keys) {
                    //         loaded_all += loaded_map[key];
                    //     }

                    //     const range = `${parseInt((loaded_all / total * 100))}%`
                    //     $('#loading>.progress>.progress-bar').css('width', range).text(range);
                    // } else {
                    //     total += xhr.total;
                    // }
                },
                (error) => { // onError
                    console.log('error', error);
                }
            )
        })
        promises.push(promise);
    }

    // 异步全部结束后对获取的楼进行处理
    Promise.all(promises).then(function (posts) {
        callback(posts);
    })
}

export default analysisFBX;
