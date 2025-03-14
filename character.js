import { CharacterModel } from './characterModel.js';
import * as THREE from 'three';

export class Character {
    constructor(scene, mazeGrid, wallSize, mazeObjects, bodyColor = 0x0000ff, isNPC = false, initialDirection = null, allCharacters = [], camera) {
        this.scene = scene;
        this.mazeGrid = mazeGrid;
        this.wallSize = wallSize;
        this.mazeObjects = mazeObjects;
        this.allCharacters = allCharacters;
        this.position = { x: 5.3, z: 4.9 };
        this.isNPC = isNPC;
        this.direction = initialDirection || new THREE.Vector3(0, 0, -1);

        // setup
        this.lives = 1;
        this.timeForLevel = 120;
        this.timeLeft = this.timeForLevel;
        this.startTime = null;
        this.isFirstPerson = true;

        // initialize
        this.characterModel = new CharacterModel(this.wallSize, bodyColor);
        this.characterGroup = this.characterModel.getCharacterGroup();

        if (!this.characterGroup) {
            console.error("characterGroup is undefined.");
        } else {
            this.scene.add(this.characterGroup);
        }

        this.updatePosition();
        this.updateBoundingBox();

        if (!this.isNPC) {
            this.setupControls();
        }

        this.clock = new THREE.Clock();
        this.animate();
    }

    updatePosition() {
        if (!this.characterGroup) {
            console.error("characterGroup is undefined");
            return;
        }
    
        this.characterGroup.position.set(
            (this.position.x - 0.2) * this.wallSize - (this.mazeGrid[0].length * this.wallSize) / 2,
            0.3,
            -((this.position.z - 0.5) * this.wallSize - (this.mazeGrid.length * this.wallSize) / 2)
        );
        this.updateBoundingBox();
    
        // position updating
        if (!this.isNPC) {
            document.getElementById("position").innerText = `${this.position.x.toFixed(2)}, ${this.position.z.toFixed(2)}`;
        }
    }

    updateBoundingBox() {
        if (!this.characterGroup) {
            console.error("characterGroup is undefined");
            return;
        }

        this.boundingBox = new THREE.Box3().setFromObject(this.characterGroup);
    }

    reset() {
        // reset position
        this.position = { x: 5.3, z: 4.9 };
        this.updatePosition();
    
        // reset everything
        this.direction = new THREE.Vector3(0, 0, -1);
    
        if (!this.isNPC) {
            this.lives = 1;
            document.getElementById("lives").innerText = this.lives;
        }
    
        if (!this.isNPC) {
            this.timeLeft = this.timeForLevel;
            this.startTime = performance.now();
            document.getElementById("time").innerText = this.timeLeft;
        }
    
        this.characterModel.stopWalking();
    }

    resetGame() {
        this.reset();
    
        for (const character of this.allCharacters) {
            if (character.isNPC) {
                character.reset();
            }
        }
    
        document.getElementById("lives").innerText = this.lives;
        document.getElementById("time").innerText = this.timeLeft;
    }
    

    createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'control-panel';
        panel.innerHTML = `
            <div> Lives: <span id="lives">${this.lives}</span> </div>
            <div> Time Left: <span id="time">${this.timeLeft}</span> </div>
            <div> Position: <span id="position">${this.position.x.toFixed(2)}, ${this.position.z.toFixed(2)}</span></div>
            <div> Controls: Arrow Keys to Move, C to Change Camera POV </div>
            <button id="start-game">Start Game (Enter)</button>
            <button id="toggle-pov">Toggle POV (C)</button>
        `;
        panel.style.position = 'absolute';
        panel.style.top = '10px';
        panel.style.left = '10px';
        panel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        panel.style.color = 'white';
        panel.style.padding = '10px';
        panel.style.borderRadius = '5px';
        document.body.appendChild(panel);
    
        document.getElementById('start-game').addEventListener('click', () => this.resetGame());
    }
    

    checkCollision(newX, newZ, direction = null) {
        const buffer = 0.5;
        const gridX = Math.floor(newX / this.wallSize);
        const gridZ = Math.floor(newZ / this.wallSize);
    
        // wall collisions
        if (
            gridX < buffer || gridX >= this.mazeGrid[0].length - buffer ||
            gridZ < buffer || gridZ >= this.mazeGrid.length - buffer ||
            this.mazeGrid[gridZ][gridX] === 1
        ) {
            return true;
        }
    
        // scooter collisions
        if (this.mazeObjects && this.mazeObjects.objects) {
            for (const scooter of this.mazeObjects.objects) {
                scooter.updateBoundingBox();
                if (this.boundingBox.intersectsBox(scooter.boundingBox)) {
                    const moveAway = direction && direction.dot(this.direction) < 0;
                    if (!moveAway) {
                        return true;
                    }
                }
            }
        }
    
        // NPC collision
        for (const character of this.allCharacters) {
            if (character !== this) {
                character.updateBoundingBox();
                if (this.boundingBox.intersectsBox(character.boundingBox)) {
                    if (!this.isNPC) {
                        this.lives -= 1; // player dies
                        console.log("player dead: lives: ", this.lives); 
                        document.getElementById("lives").innerText = this.lives; 
                        if (this.lives <= 0) {
                            alert("Game Over! You ran out of lives.");
                            this.resetGame(); 
                        }
                    }
                    return true;
                }
            }
        }
    
        return false;
    }

    moveNPC(deltaTime) {
        if (!this.isNPC) return;

        const speed = 2 * deltaTime;
        const potentialMoves = [
            this.direction,
            new THREE.Vector3(this.direction.z, 0, -this.direction.x),
            new THREE.Vector3(-this.direction.z, 0, this.direction.x),
            this.direction.clone().multiplyScalar(-1)
        ];

        for (const move of potentialMoves) {
            const newX = this.position.x + move.x * speed;
            const newZ = this.position.z + move.z * speed;
            if (!this.checkCollision(newX, newZ, move)) {
                this.direction = move;
                this.position.x = newX;
                this.position.z = newZ;
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

            if (direction && !this.checkCollision(newX, newZ, direction)) {
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
    
        if (this.isNPC) {
            this.moveNPC(deltaTime);
        }
    
        this.characterModel.update(deltaTime);
    
        if (!this.startTime) this.startTime = performance.now();
        this.timeLeft = this.timeForLevel - Math.floor((performance.now() - this.startTime) / 1000);
    
        // Check for collisions with NPCs
        if (!this.isNPC) {
            for (const character of this.allCharacters) {
                if (character !== this && character.isNPC) {
                    character.updateBoundingBox();
                    if (this.boundingBox.intersectsBox(character.boundingBox)) {
                        console.log("Collision detected with NPC"); // Debugging
                        this.lives -= 1; // Player loses a life
                        document.getElementById("lives").innerText = this.lives;
                        if (this.lives <= 0) {
                            alert("Game Over! You ran out of lives.");
                            this.resetGame(); // Reset the game
                        }
                        break; // Exit the loop after handling the collision
                    }
                }
            }
        }
    
        document.getElementById("lives").innerText = this.lives;
        document.getElementById("time").innerText = this.timeLeft;
    
        requestAnimationFrame(() => this.animate());
    }
}