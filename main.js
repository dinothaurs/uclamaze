import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10); // Adjusted camera position
camera.lookAt(0, 0, 0); // Adjusted lookAt target

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// Add axes helper for debugging
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, 0, 1.0).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x505050); // Soft white light
scene.add(ambientLight);

// Maze grid
const mazeGrid = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
];

const wallSize = 1;
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 }); // Dark red walls

// Create a cube geometry for the walls
const cubeGeometry = new THREE.BoxGeometry(wallSize, wallSize, wallSize);

for (let i = 0; i < mazeGrid.length; i++) {
    for (let j = 0; j < mazeGrid[i].length; j++) {
        if (mazeGrid[i][j] === 1) { // Place walls
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
floor.position.set(0, 0, 0);
scene.add(floor);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
