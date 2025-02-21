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
    camera.position.set(0, 15, 0);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // // Load the grass background texture
    // const grassBackgroundTexture = new THREE.TextureLoader().load('docs/darkgrass.jpg'); 

    // // Set the background of the scene to the grassy texture
    // scene.background = grassBackgroundTexture;
    
    // Lighting
    const pointLight = new THREE.PointLight(0xffffff, 100, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0.5, 0, 1.0).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x505050);
    scene.add(ambientLight);
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

    const wallMaterial = new THREE.MeshPhongMaterial({
      map: brickTexture,  
      bumpMap: brickTexture, 
      bumpScale: 0.5,  
    });

    cubeGeometry = new THREE.BoxGeometry(wallSize, wallSize, wallSize);

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

    // Add player character
    character = new Character(scene, mazeGrid, wallSize);
}

// TODO: fix restart, right now clicking on button leads to black screen
function restartMaze() {
  // Hide the popup
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

// Show the popup when the player reaches the exit
function showPopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "block"; // Show the popup

    const restartButton = document.getElementById("restartButton");
    restartButton.addEventListener("click", restartMaze);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    // Get player's current position in 3D space
    const { x, z } = character.getPosition();

    // Check if the character is within the range of the exit
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