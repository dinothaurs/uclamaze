import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MazeGenerator } from './maze.js'; // MazeGenerator (02.20.25)

const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//camera.position.set(10, 10, 10); // Adjusted camera position
camera.position.set(0, 15, 0); // Adjusted camera position for lookdown (02.20.25)
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

/*
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
*/

// Maze grid 
const mazeSize = { width: 5, height: 5 }; // set size of maze
const mazeGenerator = new MazeGenerator(mazeSize.height, mazeSize.width);
const mazeGrid = mazeGenerator.draw_maze();
// (02.20.25)

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
//floor.position.set(0, 0, 0); 
floor.position.set(-wallSize/ 2, 0, wallSize / 2); // adjust floor location (02.20.25)
scene.add(floor);

// Add player ball(02.20.25)
const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);

// location of ball(02.20.25)
let ballX = 1;
let ballZ = 1;
ball.position.set(ballX * wallSize - mazeGrid[0].length / 2, 0.3, -ballZ * wallSize + mazeGrid.length / 2);
scene.add(ball);

// add goal location(02.20.25)
const goalGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const goalMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
const goal = new THREE.Mesh(goalGeometry, goalMaterial);

// location of goal(02.20.25)
const goalX = mazeGrid[0].length - 2;
const goalZ = mazeGrid.length - 2;
goal.position.set(goalX * wallSize - mazeGrid[0].length / 2, 0.25, -goalZ * wallSize + mazeGrid.length / 2);
scene.add(goal);

// movement of ball(02.20.25)
let ballVelocity = { x: 0, z: 0 };
const speed = 1;
document.addEventListener("keydown", (event) => {
    let newX = ballX, newZ = ballZ;

    switch (event.key) {
        case "ArrowDown":    newZ -= 1; break;
        case "ArrowUp":  newZ += 1; break;
        case "ArrowLeft":  newX -= 1; break;
        case "ArrowRight": newX += 1; break;
    }
	
// collision detect(02.20.25)
if (mazeGrid[newZ][newX] === 0) {
        ballX = newX;
        ballZ = newZ;
        ball.position.set(ballX * wallSize - mazeGrid[0].length / 2, 0.3, -ballZ * wallSize + mazeGrid.length / 2);
    }
// alarm for arrival(02.20.25)
if (ballX === goalX && ballZ === goalZ) {
     alert("Goal!");
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
