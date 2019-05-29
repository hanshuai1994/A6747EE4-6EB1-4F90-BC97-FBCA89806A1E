// import * as THREE from "three";
import FBXLoader from '../loaders/FBXLoader';

const loader = new FBXLoader();

const loadModel = (path, builds_map) => {
    const key = path.substr(9, 2);
    const name = path.split('.')[1].split('/')[2].slice(2);

    return new Promise(function (resolve, reject) {
        loader.load(
            path, // path
            object => { // onLoad
                object.name = name;
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
        
        promise = promise.then(function () {
            return loadModel(path, builds_map);
        })

    }

    promise.then(function () {
        callback();
    })
}

export default analysisFBX;
