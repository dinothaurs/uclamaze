import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MazeGenerator } from './maze.js';
import { Character } from './character.js';
import { MazeObjects } from './object.js';


const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, 0, 1.0).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x505050);
scene.add(ambientLight);

// Maze generation
const mazeSize = { width: 10, height: 10 };
const mazeGenerator = new MazeGenerator(mazeSize.height, mazeSize.width);
const mazeGrid = mazeGenerator.draw_maze();

const wallSize = 1;
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
const cubeGeometry = new THREE.BoxGeometry(wallSize, wallSize, wallSize);

for (let i = 0; i < mazeGrid.length; i++) {
    for (let j = 0; j < mazeGrid[i].length; j++) {
        if (mazeGrid[i][j] === 1) {
            let wall = new THREE.Mesh(cubeGeometry, wallMaterial);
            wall.position.set(j * wallSize - mazeGrid[0].length / 2, wallSize / 2, -i * wallSize + mazeGrid.length / 2);
            scene.add(wall);
        }
    }
}


// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(mazeGrid[0].length * wallSize, mazeGrid.length * wallSize),
    new THREE.MeshPhongMaterial({ color: 0xaaaaaa })
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(-wallSize / 2, 0, wallSize / 2);
scene.add(floor);

// Add player character
const character = new Character(scene, mazeGrid, wallSize);
const mazeObjects = new MazeObjects(scene, mazeGrid, wallSize);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
