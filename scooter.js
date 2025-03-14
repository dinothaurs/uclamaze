import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class Scooter {
    constructor(scene, position = { x: 0, y: 0, z: 0 }, scale = 0.0005) {
        this.scene = scene;
        this.position = position;
        this.scale = scale;
        this.model = null;
        this.boundingBox = new THREE.Box3(); 
        this.loadModel();
    }

    loadModel() {
        const loader = new FBXLoader();
        loader.load('docs/Skate_Board_.fbx', (object) => {
            object.scale.set(this.scale, this.scale, this.scale);
            object.position.set(this.position.x, this.position.y, this.position.z);

            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true; 
                    child.receiveShadow = true; 
                }
            });

            this.scene.add(object);
            this.model = object;

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

    // bounding box for collision control
    updateBoundingBox() {
        if (this.model) {
            this.boundingBox.setFromObject(this.model);
        }
    }

    // check collision
    checkCollision(targetBox) {
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
        return this.position; // go back to initial
    }

    getSize() {
        if (this.boundingBox) {
            const size = new THREE.Vector3();
            this.boundingBox.getSize(size);
            return size;
        }
        return { x: 1, y: 1, z: 1 }; // go to default
    }
}