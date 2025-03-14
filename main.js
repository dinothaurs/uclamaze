import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MazeGenerator } from './maze.js';
import { Character } from './character.js';
import { MazeObjects } from './object.js';
import { Scooter } from './scooter.js';


// Global variables
let scene, camera, renderer, controls;
let mazeSize, wallSize, wallMaterial, cubeGeometry;
let mazeGenerator, mazeGrid, mazeObjects, character;
let scooter;
let controlPanel;
let isFirstPerson = false;

// Initialize the scene, camera, renderer, and controls
function initScene() {
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadow mapping
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
    document.body.appendChild(renderer.domElement);

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = !isFirstPerson; // Disable orbit controls in first-person view
    controls.update();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    // Directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10); // Position the light
    directionalLight.castShadow = true; // Enable shadow casting

    // Shadow map settings
    directionalLight.shadow.mapSize.width = 2048; // Higher resolution for better shadows
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;

    scene.add(directionalLight);

    // Event listener for POV toggle
    document.addEventListener('keydown', (event) => {
        if (event.key === 'c' || event.key === 'C') {
            togglePOV();
        }
    });
}

// Function to toggle between first-person and third-person perspectives
function togglePOV() {
    isFirstPerson = !isFirstPerson;
    controls.enabled = !isFirstPerson; // Disable orbit controls in first-person view

    if (isFirstPerson) {
        const characterPosition = character.characterGroup.position;
    
        // Offset the camera slightly above and behind the character
        const offset = new THREE.Vector3(-2, 2, 5); // Adjust these values as needed
        offset.applyQuaternion(character.characterGroup.quaternion); // Apply the character's rotation to the offset
        camera.position.copy(characterPosition).add(offset);
    
        // Calculate the look-at target based on the character's forward direction
        const forward = new THREE.Vector3(0, 0, -1); // Default forward direction in Three.js
        forward.applyQuaternion(character.characterGroup.quaternion); // Apply the character's rotation
        const lookAtTarget = characterPosition.clone().add(forward); // Look at a point directly in front of the character
    
        // Make the camera look at the calculated target
        camera.lookAt(lookAtTarget);
    } else {
        // Third-person view: position the camera above the maze
        const mazeWidth = mazeSize.width * wallSize; 
        const mazeDepth = mazeSize.height * wallSize; 
        const maxDimension = Math.max(mazeWidth, mazeDepth);
        const cameraHeight = maxDimension * 7; 
        camera.position.set(0, cameraHeight, 0); 
        camera.lookAt(mazeWidth / 2, 0, mazeDepth / 2);
    }
}


// Setup and generate the game (maze, walls, floor, objects, and character)
function setupGame() {
    // Maze generation
    mazeSize = { width: 10, height: 10 };
    mazeGenerator = new MazeGenerator(mazeSize.height, mazeSize.width);
    mazeGrid = mazeGenerator.draw_maze();

    wallSize = 1;
    const textureLoader = new THREE.TextureLoader();
    const brickTexture = textureLoader.load('docs/bricks.jpg'); 
    brickTexture.repeat.set(0.3, 0.3);

    wallMaterial = new THREE.MeshPhongMaterial({
      map: brickTexture,  
      bumpMap: brickTexture, 
      bumpScale: 0.5,  
    });

    const wallHeight = 4; //make wall taller
    cubeGeometry = new THREE.BoxGeometry(wallSize, wallHeight, wallSize);

    // Add walls to the scene
    for (let i = 0; i < mazeGrid.length; i++) {
        for (let j = 0; j < mazeGrid[i].length; j++) {
            if (mazeGrid[i][j] === 1) {
                let wall = new THREE.Mesh(cubeGeometry, wallMaterial);
                wall.position.set(j * wallSize - mazeGrid[0].length / 2, wallSize / 2, -i * wallSize + mazeGrid.length / 2);
                scene.add(wall);
            }
        }
    }

    // Add floor to the scene
    const grassTexture = textureLoader.load('docs/grass.jpg'); 
    grassTexture.repeat.set(0.5, 0.5);
    
    grassTexture.repeat.set(5, 5); 
    const floorMaterial = new THREE.MeshPhongMaterial({
        map: grassTexture, 
    });
    
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(mazeGrid[0].length * wallSize, mazeGrid.length * wallSize),
        floorMaterial  
    );
    
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(-wallSize / 2, 0, wallSize / 2); 
    scene.add(floor);
    mazeObjects = new MazeObjects(scene, mazeGrid, wallSize);

    const scooterPosition = getRandomValidPosition(mazeGrid); 
    if (scooterPosition) {
        scooter = new Scooter(
            scene, 
            { 
                x: scooterPosition.x * wallSize - mazeGrid[0].length / 2, 
                y: wallSize / 2, 
                z: -scooterPosition.z * wallSize + mazeGrid.length / 2 
            }, 
            0.001 // Adjust scale if needed
        );
    }

    // Add player character
    character = new Character(scene, mazeGrid, wallSize, mazeObjects);

    // controlPanel = new ControlPanel(character);

    //adjust if we want to add more NPCs
    for (let i = 0; i < 18; i++) {
        const randomPosition = getRandomValidPosition(mazeGrid);
        if (randomPosition) {
            const isHorizontal = Math.random() < 0.5;
            const direction = isHorizontal 
                ? new THREE.Vector3(1, 0, 0)
                : new THREE.Vector3(0, 0, -1); 
    
            const newCharacter = new Character(
                scene,
                mazeGrid,
                wallSize,
                mazeObjects,
                0xff0000,
                true,
                direction 
            );
            newCharacter.position = randomPosition;
            newCharacter.updatePosition();
        }
    }

    // Adjust camera to view the entire maze
    adjustCameraToViewMaze();
}

// adjust the camera to view the entire maze
function adjustCameraToViewMaze() {
    const mazeWidth = mazeSize.width * wallSize; 
    const mazeDepth = mazeSize.height * wallSize; 

    const maxDimension = Math.max(mazeWidth, mazeDepth);

    const cameraHeight = maxDimension * 7; 
    camera.position.set(0, cameraHeight, 0); 

    camera.lookAt(mazeWidth / 2, 0, mazeDepth / 2); 
    camera.rotation.x = -Math.PI / 2; 
}

// TODO(not as important): fix restart, right now clicking on button leads to black screen
function restartMaze() {
    const popup = document.getElementById("popup");
    popup.style.display = "none";

    clearScene();
    setupGame();
}

function clearScene() {
  while (scene.children.length > 0) {
      const object = scene.children[0];
      scene.remove(object); // Remove each object from the scene
  }
}

// show exit popup
function showPopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "block";

    const restartButton = document.getElementById("restartButton");
    restartButton.addEventListener("click", restartMaze);
}

//helper fo getting random pos for npcs
function getRandomValidPosition(mazeGrid) {
    const validPositions = [];

    // collect all valid positions
    for (let i = 0; i < mazeGrid.length; i++) {
        for (let j = 0; j < mazeGrid[i].length; j++) {
            if (mazeGrid[i][j] === 0) {
                validPositions.push({ x: j, z: i });
            }
        }
    }

    if (validPositions.length > 0) {
        return validPositions[Math.floor(Math.random() * validPositions.length)];
    } else {
        console.error("No valid positions found in the maze.");
        return null;
    }
}

// Animation loop
let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    if (isFirstPerson) {
        const characterPosition = character.characterGroup.position;
        const offset = new THREE.Vector3(0, 1.5, -2); // Adjust these values as needed
        offset.applyQuaternion(character.characterGroup.quaternion); // Apply the character's rotation to the offset
        camera.position.copy(characterPosition).add(offset);

        // Make the camera look in the direction the character is facing
        const lookAtTarget = new THREE.Vector3(0, 0, -1).applyQuaternion(character.characterGroup.quaternion);
        camera.lookAt(characterPosition.clone().add(lookAtTarget));
    }

    controls.update();
    renderer.render(scene, camera);

    // Update camera position and orientation in first-person view
    if (isFirstPerson) {
        const characterPosition = character.getPosition();
        camera.position.set(characterPosition.x, characterPosition.y + 2, characterPosition.z + 5);
        camera.lookAt(characterPosition.x, characterPosition.y, characterPosition.z);
    }

    // get pos
    const { x, z } = character.getPosition();

    // check within range
    const exitX = (mazeSize.width * 2 - 1) * wallSize;
    const exitZ = (mazeSize.height * 2 - 1) * wallSize;
    const distanceToExit = Math.sqrt(Math.pow(x - exitX, 2) + Math.pow(z - exitZ, 2));

    if (distanceToExit < wallSize) {
        showPopup();
    }
}

// Initialize the game
function initGame() {
    initScene(); 
    setupGame(); 
    renderer.setAnimationLoop(animate); 
}

// Start the game
initGame();