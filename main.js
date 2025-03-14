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

// initialize the scene, camera, renderer, and controls
function initScene() {
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    document.body.appendChild(renderer.domElement);

    // controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = !isFirstPerson; // No orbit when first person
    controls.update();

    // lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
    scene.add(ambientLight);

    // Directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10); 
    directionalLight.castShadow = true; 

    // camera for shadow
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;

    scene.add(directionalLight);


    // event listener for POV toggle
    document.addEventListener('keydown', (event) => {
        if (event.key === 'c' || event.key === 'C') {
            togglePOV();
        }
    });
}


// Function to toggle between first-person and third-person perspectives
function togglePOV() {
    isFirstPerson = !isFirstPerson;
    controls.enabled = !isFirstPerson; 

    if (isFirstPerson) {
        const characterPosition = character.characterGroup.position;

        const offset = new THREE.Vector3(0, 1.5, 0); // play with this until right
        offset.applyQuaternion(character.characterGroup.quaternion); 
        camera.position.copy(characterPosition).add(offset);

        const forward = new THREE.Vector3(0, 0, -1); // maybe experiement here too
        forward.applyQuaternion(character.characterGroup.quaternion); 
        const lookAtTarget = characterPosition.clone().add(forward); 

        camera.lookAt(lookAtTarget);
    } else {
        //third person just above
        const mazeWidth = mazeSize.width * wallSize; 
        const mazeDepth = mazeSize.height * wallSize; 
        const maxDimension = Math.max(mazeWidth, mazeDepth);
        const cameraHeight = maxDimension * 7; 
        camera.position.set(0, cameraHeight, 0); 
        camera.lookAt(mazeWidth / 2, 0, mazeDepth / 2);
    }
}

function setupGame() {
    const groundSize = 500; 

    mazeSize = { width: 10, height: 10 };
    mazeGenerator = new MazeGenerator(mazeSize.height, mazeSize.width);
    mazeGrid = mazeGenerator.draw_maze();

    wallSize = 1;
    const textureLoader = new THREE.TextureLoader();
    const brickTexture = textureLoader.load('docs/bricks.jpg'); 
    brickTexture.repeat.set(0.3, 0.3);

    wallMaterial = new THREE.MeshStandardMaterial({
        map: brickTexture,
        bumpMap: brickTexture,
        bumpScale: 0.5,
        metalness: 0.1,
        roughness: 0.8
    });

    const wallHeight = 4; // taller wall
    cubeGeometry = new THREE.BoxGeometry(wallSize, wallHeight, wallSize);

    // add walls
    for (let i = 0; i < mazeGrid.length; i++) {
        for (let j = 0; j < mazeGrid[i].length; j++) {
            if (mazeGrid[i][j] === 1) {
                let wall = new THREE.Mesh(cubeGeometry, wallMaterial);
                wall.position.set(j * wallSize - mazeGrid[0].length / 2, wallHeight / 2, -i * wallSize + mazeGrid.length / 2);
                wall.castShadow = true; 
                wall.receiveShadow = true; 
                scene.add(wall);
            }
        }
    }

    //add grass
    const grassTexture = textureLoader.load('docs/grass.jpg'); 
    grassTexture.wrapS = THREE.RepeatWrapping; 
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(50, 50); 

    const groundMaterial = new THREE.MeshStandardMaterial({
        map: grassTexture,
        metalness: 0,
        roughness: 0.9
    });

    // generate terrain
    const groundGeometry = generateTerrain(groundSize, groundSize, 100); 
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    const blendTexture = textureLoader.load('docs/blend.jpg'); 
    blendTexture.wrapS = THREE.RepeatWrapping;
    blendTexture.wrapT = THREE.RepeatWrapping;
    blendTexture.repeat.set(5, 5);

    const blendMaterial = new THREE.MeshStandardMaterial({
        map: blendTexture,
        metalness: 0,
        roughness: 0.9
    });

    const blendWidth = mazeGrid[0].length * wallSize + 2; // Slightly larger than the maze
    const blendDepth = mazeGrid.length * wallSize + 2;
    const blendGeometry = new THREE.PlaneGeometry(blendWidth, blendDepth);
    const blendPlane = new THREE.Mesh(blendGeometry, blendMaterial);
    blendPlane.rotation.x = -Math.PI / 2;
    blendPlane.position.set(-wallSize / 2, -0.01, wallSize / 2); // Slightly below the maze floor
    blendPlane.receiveShadow = true;
    scene.add(blendPlane);

    // Add the maze floor
    const mazeFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(mazeGrid[0].length * wallSize, mazeGrid.length * wallSize),
        groundMaterial  
    );
    mazeFloor.rotation.x = -Math.PI / 2;
    mazeFloor.position.set(-wallSize / 2, 0, wallSize / 2); 
    mazeFloor.receiveShadow = true; 
    scene.add(mazeFloor);

    mazeObjects = new MazeObjects(scene, mazeGrid, wallSize);

    //scooter objects
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

    const allCharacters = [];

    const controlPanel = document.createElement('div');
    controlPanel.id = 'control-panel';
    controlPanel.innerHTML = `
        <div> Lives: <span id="lives">3</span> </div>
        <div> Time Left: <span id="time">120</span> </div>
        <div> Position: <span id="position">5.30, 4.90</span></div>
        <div> Controls: Arrow Keys to Move, C to Change Camera POV </div>
        <button id="start-game">Start Game (Enter)</button>
        <button id="toggle-pov">Toggle POV (C)</button>
    `;
    controlPanel.style.position = 'absolute';
    controlPanel.style.top = '10px';
    controlPanel.style.left = '10px';
    controlPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    controlPanel.style.color = 'white';
    controlPanel.style.padding = '10px';
    controlPanel.style.borderRadius = '5px';
    document.body.appendChild(controlPanel);

    // add player
    character = new Character(scene, mazeGrid, wallSize, mazeObjects, 0x0000ff, false, null, allCharacters);
    allCharacters.push(character); // add all npcs and char to list

    // Add NPCs
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
                true, // isNPC
                direction,
                allCharacters 
            );
            newCharacter.position = randomPosition;
            newCharacter.updatePosition();
            allCharacters.push(newCharacter); // add to list
        }
    }

    adjustCameraToViewMaze();
}

function generateTerrain(width, depth, segments) {
    const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
    const vertices = geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        const noiseValue = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5; 
        vertices[i + 1] = noiseValue; 
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals(); 
    return geometry;
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
      scene.remove(object); // remove each object from the scene
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
    const deltaTime = (currentTime - lastTime) / 1000; // convert to sec
    lastTime = currentTime;

    if (isFirstPerson) {
        const characterPosition = character.characterGroup.position;
        const offset = new THREE.Vector3(0, 1.5, -2); // play around with these
        offset.applyQuaternion(character.characterGroup.quaternion); 
        camera.position.copy(characterPosition).add(offset);

        // make the camera look in the direction the character is facing, a little weird rn
        const lookAtTarget = new THREE.Vector3(0, 0, -1).applyQuaternion(character.characterGroup.quaternion);
        camera.lookAt(characterPosition.clone().add(lookAtTarget));
    }

    controls.update();
    renderer.render(scene, camera);

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