import * as THREE from 'three';

export class Character {
    constructor(scene, mazeGrid, wallSize) {
        this.scene = scene;
        this.mazeGrid = mazeGrid;
        this.wallSize = wallSize;
        this.position = { x: 1, z: 1 }; // Initial position in the maze
        
        this.createCharacter();
        this.setupControls();
    }

    createCharacter() {
        const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
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
}
