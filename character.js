import { CharacterModel } from './characterModel.js';
import * as THREE from 'three';

export class Character {
    constructor(scene, mazeGrid, wallSize, mazeObjects, bodyColor = 0x0000ff, isNPC = false) {
        this.scene = scene;
        this.mazeGrid = mazeGrid;
        this.wallSize = wallSize;
        this.mazeObjects = mazeObjects;
        this.position = { x: 1, z: 1 };
        this.isNPC = isNPC; // Flag to identify NPCs
        this.direction = new THREE.Vector3(0, 0, -1); // Initial direction (forward)

        this.characterModel = new CharacterModel(this.wallSize, bodyColor);
        this.characterGroup = this.characterModel.getCharacterGroup();
        this.updatePosition();
        this.scene.add(this.characterGroup);

        if (!this.isNPC) {
            this.setupControls(); // Only set up controls for the player character
        }

        // Animation loop
        this.clock = new THREE.Clock();
        this.animate();
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

    //npc walk
    checkCollision(newX, newZ) {
        // Ensure newX and newZ are within the maze bounds
        if (
            newX < 0 || newX >= this.mazeGrid[0].length ||
            newZ < 0 || newZ >= this.mazeGrid.length
        ) {
            return true; // Out of bounds, treat as a collision
        }

        // Check if the new position is a wall (1 represents a wall)
        if (this.mazeGrid[Math.floor(newZ)][Math.floor(newX)] === 1) {
            return true; // Collision with wall
        }

        return false; // No collision
    }

    moveNPC(deltaTime) {
        if (!this.isNPC) return; 

        const speed = 2;
        const newX = this.position.x + this.direction.x * speed * deltaTime;
        const newZ = this.position.z + this.direction.z * speed * deltaTime;

        //check collision
        if (this.checkCollision(Math.floor(newX), Math.floor(newZ))) {
            //turn 180
            this.direction.multiplyScalar(-1); 
            this.characterModel.setDirection(this.direction); 
        } else {
            this.position.x = newX;
            this.position.z = newZ;
            this.updatePosition();
        }

        this.characterModel.startWalking();
    }

    setupControls() {
        document.addEventListener("keydown", (event) => {
            let newX = this.position.x, newZ = this.position.z;
            let direction = null;
    
            switch (event.key) {
                case "ArrowDown":
                    newZ -= 1;
                    direction = new THREE.Vector3(0, 0, 1); // Move backward
                    break;
                case "ArrowUp":
                    newZ += 1;
                    direction = new THREE.Vector3(0, 0, -1); // Move forward
                    break;
                case "ArrowLeft":
                    newX -= 1;
                    direction = new THREE.Vector3(-1, 0, 0); // Move left
                    break;
                case "ArrowRight":
                    newX += 1;
                    direction = new THREE.Vector3(1, 0, 0); // Move right
                    break;
            }
    
            if (direction && this.mazeGrid[newZ][newX] === 0) {
                this.position.x = newX;
                this.position.z = newZ;
                this.updatePosition();
    
                // Set the new movement direction for smooth rotation
                this.characterModel.setDirection(direction);
    
                // Start walking animation
                this.characterModel.startWalking();
    
                // Stop walking animation after a short delay
                setTimeout(() => {
                    this.characterModel.stopWalking();
                }, 200); // Adjust the delay to match the walking speed
            }
        });
    }

    getPosition() {
        return this.position;
    }

    // Animation loop
    animate() {
        const deltaTime = this.clock.getDelta();
        this.characterModel.update(deltaTime);
        if (this.isNPC) {
            this.moveNPC(deltaTime); // Move NPCs
        }
        requestAnimationFrame(() => this.animate());
    }
}