import {CharacterModel} from './characterModel.js';
//TODO: character animation

export class Character {
    constructor(scene, mazeGrid, wallSize, mazeObjects) {
        this.scene = scene;
        this.mazeGrid = mazeGrid;
        this.wallSize = wallSize;
        this.mazeObjects = mazeObjects;
        this.position = { x: 1, z: 1 };

        this.characterModel = new CharacterModel(this.wallSize);
        this.characterGroup = this.characterModel.getCharacterGroup();
        this.updatePosition();
        this.scene.add(this.characterGroup);
        this.setupControls();
    }

    updatePosition() {
        this.characterGroup.position.set(
            this.position.x * this.wallSize - this.mazeGrid[0].length / 2,
            0.3,
            -this.position.z * this.wallSize + this.mazeGrid.length / 2
        );
    }

    checkCollision(newX, newZ) {
        if (!this.mazeObjects || !this.mazeObjects.objectCoordinates) {
            console.error("Maze objects are not properly initialized.");
            return false;
        }

        for (const objectPos of this.mazeObjects.objectCoordinates) {
            const tolerance = 0.2;
            if (Math.abs(objectPos.x - newX) < tolerance && Math.abs(objectPos.y - newZ) < tolerance) {
                return true;
            }
        }
        return false;
    }

    setupControls() {
        document.addEventListener("keydown", (event) => {
            let newX = this.position.x, newZ = this.position.z;
            switch (event.key) {
                case "ArrowDown": newZ -= 1; break;
                case "ArrowUp": newZ += 1; break;
                case "ArrowLeft": newX -= 1; break;
                case "ArrowRight": newX += 1; break;
            }
            if (this.mazeGrid[newZ][newX] === 0) {
                this.position.x = newX;
                this.position.z = newZ;
                this.updatePosition();
            }
        });
    }

    getPosition() {
        return this.position;
    }
}
