import * as THREE from 'three';

export class MazeObjects {
    constructor(scene, mazeGrid, wallSize) {
        this.scene = scene;
        this.mazeGrid = mazeGrid;
        this.wallSize = wallSize;
        this.objects = [];
        this.numObjects = Math.floor(mazeGrid.length * mazeGrid[0].length * 0.05); // Adjust density

        this.placeObjects();
    }

    placeObjects() {
        let openSpaces = [];

        // Find all open spaces in the maze where objects can be placed
        for (let i = 1; i < this.mazeGrid.length - 1; i++) {
            for (let j = 1; j < this.mazeGrid[i].length - 1; j++) {
                if (this.mazeGrid[i][j] === 0) { // 0 means open path
                    openSpaces.push({ x: j, y: i });
                }
            }
        }

        // Shuffle and select random positions for objects
        this.shuffleArray(openSpaces);
        let selectedPositions = openSpaces.slice(0, this.numObjects);

        // Place objects in the scene
        selectedPositions.forEach(pos => this.createObject(pos.x, pos.y));
    }

    createObject(gridX, gridY) {
        const objectSize = this.wallSize * 0.2; // Slightly smaller than wallSize
        const geometry = new THREE.SphereGeometry(objectSize / 2, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const object = new THREE.Mesh(geometry, material);

        object.position.set(
            gridX * this.wallSize - this.mazeGrid[0].length / 2,
            objectSize / 2,
            -gridY * this.wallSize + this.mazeGrid.length / 2
        );

        this.scene.add(object);
        this.objects.push(object);
        console.log('MazeObjects initialized');
        console.log(this.objects); 
    }

    // Fisher-Yates shuffle algorithm for randomizing positions
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    getObjects() {
        return this.objects;
    }
}