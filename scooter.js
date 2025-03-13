import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class Scooter {
    constructor(scene, position = { x: 0, y: 0, z: 0 }, scale = 0.0005) {
        this.scene = scene;
        this.position = position;
        this.scale = scale;
        this.model = null;
        this.boundingBox = null; // create a box for collision detection
        this.loadModel();
    }

    loadModel() {
        const loader = new FBXLoader();
        loader.load('docs/Skate_Board_.fbx', (object) => {
            object.scale.set(this.scale, this.scale, this.scale);
            object.position.set(this.position.x, this.position.y, this.position.z);
            this.scene.add(object);
            this.model = object;

            // update  bounding box
            this.updateBoundingBox();
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
            this.updateBoundingBox();
        }
    }
    //for collision detection
    updateBoundingBox() {
        if (this.model) {
            const box = new THREE.Box3().setFromObject(this.model);
            this.boundingBox = box;
        }
    }

    checkCollision(targetBox) {
        if (!this.boundingBox) return false;
        return this.boundingBox.intersectsBox(targetBox);
    }
    getPosition() {
        if (this.model) {
            return {
                x: this.model.position.x,
                y: this.model.position.y,
                z: this.model.position.z
            };
        }
        return this.position; // Fallback to initial position if model is not loaded yet
    }
    getSize() {
        if (this.boundingBox) {
            const size = new THREE.Vector3();
            this.boundingBox.getSize(size);
            return size;
        }
        return { x: 1, y: 1, z: 1 }; // Default size if bounding box is not available
    }
}