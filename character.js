import { CharacterModel } from './characterModel.js';
import * as THREE from 'three';

export class Character {
    constructor(scene, mazeGrid, wallSize, mazeObjects, bodyColor = 0x0000ff, isNPC = false, initialDirection = null) {
        this.scene = scene;
        this.mazeGrid = mazeGrid;
        this.wallSize = wallSize;
        this.mazeObjects = mazeObjects;
        this.position = { x: 5.3, z: 4.9 };
        this.isNPC = isNPC;
        this.direction = initialDirection || new THREE.Vector3(0, 0, -1);

        this.characterModel = new CharacterModel(this.wallSize, bodyColor);
        this.characterGroup = this.characterModel.getCharacterGroup();
        this.updatePosition();
        this.scene.add(this.characterGroup);

        if (!this.isNPC) {
            this.setupControls();
        }

        this.clock = new THREE.Clock();
        this.animate();
    }

    updatePosition() {
        this.characterGroup.position.set(
            (this.position.x - 0.2) * this.wallSize - (this.mazeGrid[0].length * this.wallSize) / 2,
            0.3,
            -((this.position.z - 0.5) * this.wallSize - (this.mazeGrid.length * this.wallSize) / 2)
        );
    }

    checkCollision(newX, newZ) {
        const buffer = 0.5;
        const gridX = Math.floor(newX / this.wallSize);
        const gridZ = Math.floor(newZ / this.wallSize);

        if (
            gridX < buffer || gridX >= this.mazeGrid[0].length - buffer ||
            gridZ < buffer || gridZ >= this.mazeGrid.length - buffer ||
            this.mazeGrid[gridZ][gridX] === 1
        ) {
            return true;
        }

        if (this.mazeObjects && this.mazeObjects.objects) {
            for (const scooter of this.mazeObjects.objects) {
                const scooterPos = scooter.getPosition();
                const scooterSize = scooter.getSize();
                if (
                    Math.abs(newX - scooterPos.x) < scooterSize.x / 2 + buffer &&
                    Math.abs(newZ - scooterPos.z) < scooterSize.z / 2 + buffer
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    moveNPC(deltaTime) {
        if (!this.isNPC) return;

        const speed = 2;
        const stepSize = this.wallSize;
        const potentialMoves = [
            this.direction,
            new THREE.Vector3(this.direction.z, 0, -this.direction.x),
            new THREE.Vector3(-this.direction.z, 0, this.direction.x),
            this.direction.clone().multiplyScalar(-1)
        ];

        for (const move of potentialMoves) {
            const newX = this.position.x + move.x * speed * deltaTime;
            const newZ = this.position.z + move.z * speed * deltaTime;
            if (!this.checkCollision(newX, newZ)) {
                this.direction = move;
                this.position.x = Math.round(newX * 10) / 10;
                this.position.z = Math.round(newZ * 10) / 10;
                this.characterModel.setDirection(this.direction);
                this.updatePosition();
                this.characterModel.startWalking();
                return;
            }
        }

        this.characterModel.stopWalking();
    }

    setupControls() {
        document.addEventListener("keydown", (event) => {
            let newX = this.position.x, newZ = this.position.z;
            let direction = null;
            const stepSize = this.wallSize;

            switch (event.key) {
                case "ArrowDown":
                    newZ -= stepSize;
                    direction = new THREE.Vector3(0, 0, 1);
                    break;
                case "ArrowUp":
                    newZ += stepSize;
                    direction = new THREE.Vector3(0, 0, -1);
                    break;
                case "ArrowLeft":
                    newX -= stepSize;
                    direction = new THREE.Vector3(-1, 0, 0);
                    break;
                case "ArrowRight":
                    newX += stepSize;
                    direction = new THREE.Vector3(1, 0, 0);
                    break;
            }

            if (direction && !this.checkCollision(newX, newZ)) {
                this.position.x = newX;
                this.position.z = newZ;
                this.updatePosition();

                this.characterModel.setDirection(direction);
                this.characterModel.startWalking();
                setTimeout(() => {
                    this.characterModel.stopWalking();
                }, 200);
            }
        });
    }

    getPosition() {
        return this.position;
    }

    animate() {
        const deltaTime = this.clock.getDelta();
        this.characterModel.update(deltaTime);
        if (this.isNPC) {
            this.moveNPC(deltaTime);
        }
        requestAnimationFrame(() => this.animate());
    }
}
