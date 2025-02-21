import * as THREE from 'three';

export class Character {
    constructor(scene, mazeGrid, wallSize, mazeObjects) {
        this.scene = scene;
        this.mazeGrid = mazeGrid;
        this.wallSize = wallSize;
        this.mazeObjects = mazeObjects; // Pass the MazeObjects instance
        this.position = { x: 1, z: 1 }; // Initial position in the maze
        
        this.createCharacter();
        this.setupControls();
    }

    createCharacter() {
        const ballGeometry = new THREE.SphereGeometry(0.2, 10, 1);
        const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.updatePosition();
        this.scene.add(this.ball);
    }

    updatePosition() {
        this.ball.position.set(
            this.position.x * this.wallSize - this.mazeGrid[0].length / 2,
            0.3,
            -this.position.z * this.wallSize + this.mazeGrid.length / 2
        );
    }

    // Check for collision with objects
    checkCollision(newX, newZ) {
        // Ensure that mazeObjects and objectCoordinates are defined
        if (!this.mazeObjects || !this.mazeObjects.objectCoordinates) {
            console.error("Maze objects are not properly initialized.");
            return false; // No collision if objects aren't available
        }
    
        // Check if the new position matches any of the object coordinates
        for (const objectPos of this.mazeObjects.objectCoordinates) {
            // Compare positions with a small tolerance to allow for rounding issues
            const tolerance = 0.2; // Adjust as needed for precision
    
            if (Math.abs(objectPos.x - newX) < tolerance && Math.abs(objectPos.y - newZ) < tolerance) {
                return true; // Collision detected (position matches)
            }
        }
    
        return false; // No collision
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
            
            if (this.mazeGrid[newZ][newX] === 0) { // Collision detection
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