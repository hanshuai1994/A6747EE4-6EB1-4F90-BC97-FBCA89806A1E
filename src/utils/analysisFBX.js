// import * as THREE from "three";
import FBXLoader from '../loaders/FBXLoader';

const loader = new FBXLoader();

const loadModel = (path, builds_map, key) => {
    return new Promise(function (resolve, reject) {
        loader.load(
            path, // path
            object => { // onLoad
                builds_map[key].add(object);
                resolve(object);
            },
            xhr => { },// onProgress
            error => { // onError
                console.log('error', error);
                reject(error);
            }
        )
    })
}

// 
const analysisFBX = (paths, builds_map, callback) => {
    let promise = Promise.resolve();

    let length = paths.length;
    for (let i = 0; i < length; i++) {
        const path = paths[i];
        const key = path.substr(9, 2);

        promise = promise.then(function () {
            return loadModel(path, builds_map, key);
        })

    }

    promise.then(function () {
        callback();
    })
}

export default analysisFBX;
