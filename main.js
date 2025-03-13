import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MazeGenerator } from './maze.js';
import { Character } from './character.js';
import { MazeObjects } from './object.js';

// Global variables
let scene, camera, renderer, controls;
let mazeSize, wallSize, wallMaterial, cubeGeometry;
let mazeGenerator, mazeGrid, mazeObjects, character;

// Initialize the scene, camera, renderer, and controls
function initScene() {
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White directional light
    directionalLight.position.set(1, 1, 1).normalize(); // Light comes from the top-right
    scene.add(directionalLight);

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

    cubeGeometry = new THREE.BoxGeometry(wallSize, wallSize, wallSize);

    // add walls 
    for (let i = 0; i < mazeGrid.length; i++) {
        for (let j = 0; j < mazeGrid[i].length; j++) {
            if (mazeGrid[i][j] === 1) {
                let wall = new THREE.Mesh(cubeGeometry, wallMaterial);
                wall.position.set(j * wallSize - mazeGrid[0].length / 2, wallSize / 2, -i * wallSize + mazeGrid.length / 2);
                scene.add(wall);
            }
        }
    }

    // add floor
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

    // add player character
    character = new Character(scene, mazeGrid, wallSize, mazeObjects);

    // adjust camera to view the entire maze
    adjustCameraToViewMaze();
}

// adjust the camera to view the entire maze
function adjustCameraToViewMaze() {
    const mazeWidth = mazeSize.width * wallSize; 
    const mazeDepth = mazeSize.height * wallSize; 

    const maxDimension = Math.max(mazeWidth, mazeDepth);

    const cameraHeight = maxDimension * 4; 
    camera.position.set(0, cameraHeight, 0); 

    camera.lookAt(mazeWidth / 2, 0, mazeDepth / 2); 
    camera.rotation.x = -Math.PI / 2; 
}


// TODO(not as important): fix restart, right now clicking on button leads to black screen
function restartMaze() {
  // hide the popup
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

// Animation loop
let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    controls.update();
    renderer.render(scene, camera);

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