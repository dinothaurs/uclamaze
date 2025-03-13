import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class Scooter {
    constructor(scene, position = { x: 0, y: 0, z: 0 }, scale = 0.0005) {
        this.scene = scene;
        this.position = position;
        this.scale = scale;
        this.model = null;
        this.loadModel();
    }

    loadModel() {
        const loader = new FBXLoader();
        loader.load('docs/Skate_Board_.fbx', (object) => {
            object.scale.set(this.scale, this.scale, this.scale);
            object.position.set(this.position.x, this.position.y, this.position.z);
            this.scene.add(object) ;
            this.model = object;
        }, 
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, 
        (error) => {
            console.error('An error happened while loading the scooter model', error);
        });
    }

    setPosition(x, y, z) {
        if (this.model) {
            this.model.position.set(x, y, z);
        }
    }
}