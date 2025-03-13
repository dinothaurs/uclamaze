import * as THREE from 'three';
import { Scooter } from './scooter.js'; 

export class MazeObjects {
    constructor(scene, mazeGrid, wallSize) {
        this.scene = scene;
        this.mazeGrid = mazeGrid;
        this.wallSize = wallSize;
        this.objects = [];
        this.objectCoordinates = []; 
        this.numObjects = 20;

        this.placeObjects();
    }

    placeObjects() {
        let openSpaces = [];

        // find open spaces
        for (let i = 1; i < this.mazeGrid.length-1; i++) {
            for (let j = 1; j < this.mazeGrid[i].length - 1; j++) {
                if (this.mazeGrid[i][j] === 0) { // 0 = open
                    openSpaces.push({ x: j, y: i });
                }
            }
        }

        //random placement
        this.shuffleArray(openSpaces);
        let selectedPositions = openSpaces.slice(0, this.numObjects);

        selectedPositions.forEach(pos => {
            this.createScooter(pos.x, pos.y);
            this.objectCoordinates.push({ x: pos.x, y: pos.y }); 
        });
    }

    createScooter(gridX, gridY) {
        const position = {
            x: gridX * this.wallSize - this.mazeGrid[0].length / 2,
            y: 0, // adjust to make it look more liek on ground if need be
            z: -gridY * this.wallSize + this.mazeGrid.length / 2
        };
    
        const scale = 0.005; // make smaller if want scooter smaller
        const scooter = new Scooter(this.scene, position, scale);
    
        const randomRotation = Math.random() * Math.PI * 2;
        if (scooter.model) {
            scooter.model.rotation.y = randomRotation;
        } else {
            const interval = setInterval(() => {
                if (scooter.model) {
                    scooter.model.rotation.y = randomRotation;
                    clearInterval(interval);
                }
            }, 100);
        }
    
        this.objects.push(scooter); // Store the scooter instance
    }

    // Fisher-Yates shuffle algorithm for randomizing positions
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}