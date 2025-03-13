import * as THREE from 'three';

export class CharacterModel {
    constructor(wallSize) {
        this.wallSize = wallSize;
        this.characterGroup = new THREE.Group();
        this.createCharacter();

        // Animation properties
        this.isWalking = false;
        this.walkCycle = 0; 

        // Movement direction
        this.currentDirection = new THREE.Vector3(0, 0, -1); 
        this.targetDirection = this.currentDirection.clone();
        this.rotationSpeed = 5; 
    }

    createCharacter() {
        const scaleFactor = 0.7;

        // Head 
        const headGeometry = new THREE.SphereGeometry(this.wallSize * 0.28, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = this.wallSize * 1.05;

        // Body 
        const bodyGeometry = new THREE.BoxGeometry(this.wallSize * 0.56, this.wallSize * 0.84, this.wallSize * 0.35);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = this.wallSize * 0.56;

        // Arms 
        const armGeometry = new THREE.BoxGeometry(this.wallSize * 0.21, this.wallSize * 0.7, this.wallSize * 0.21);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });

        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-this.wallSize * 0.455, this.wallSize * 0.56, 0);

        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(this.wallSize * 0.455, this.wallSize * 0.56, 0);

        // Legs 
        const legGeometry = new THREE.BoxGeometry(this.wallSize * 0.28, this.wallSize * 0.84, this.wallSize * 0.28);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

        this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.leftLeg.position.set(-this.wallSize * 0.21, this.wallSize * 0.14, 0);

        this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.rightLeg.position.set(this.wallSize * 0.21, this.wallSize * 0.14, 0);

        this.characterGroup.add(this.head, this.body, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
    }

    getCharacterGroup() {
        return this.characterGroup;
    }

    //update based on rotation
    update(deltaTime) {
        if (this.isWalking) {
            this.walkCycle += deltaTime * 10; // Speed of the walking animation

            // Simulate a walking motion by rotating the legs and arms
            const legRotation = Math.sin(this.walkCycle) * 0.5; 
            const armRotation = Math.sin(this.walkCycle + Math.PI) * 0.5; 

            // Rotate legs
            this.leftLeg.rotation.x = legRotation;
            this.rightLeg.rotation.x = -legRotation;

            // Rotate arms
            this.leftArm.rotation.x = armRotation;
            this.rightArm.rotation.x = -armRotation;
        } else {
            // reset for walking
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;
        }

        this.updateRotation(deltaTime);
    }

    // update rotation for turn
    updateRotation(deltaTime) {
        const currentAngle = this.characterGroup.rotation.y;
        const targetAngle = Math.atan2(this.currentDirection.x, this.currentDirection.z);
        const angleDiff = targetAngle - currentAngle;
        const angleStep = this.rotationSpeed * deltaTime;

        if (Math.abs(angleDiff) > 0.01) {
            this.characterGroup.rotation.y += Math.sign(angleDiff) * Math.min(angleStep, Math.abs(angleDiff));
        }
    }

    // set movement direction
    setDirection(direction) {
        this.currentDirection = direction.clone().normalize(); //normlaize
    }

    // start walking
    startWalking() {
        this.isWalking = true;
    }

    // stop walking
    stopWalking() {
        this.isWalking = false;
    }
}
