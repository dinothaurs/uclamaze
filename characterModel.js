import * as THREE from 'three';

export class CharacterModel {
    constructor(wallSize, bodyColor = 0x0000ff) { 
        this.wallSize = wallSize;
        this.characterGroup = new THREE.Group();
        this.createCharacter(bodyColor);

        // Animation properties
        this.isWalking = false;
        this.walkCycle = 0;
    }

    createCharacter(bodyColor) {
        const scaleFactor = 0.7;

        // Head 
        const headGeometry = new THREE.SphereGeometry(this.wallSize * 0.28, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99, metalness: 0.1, roughness: 0.8 });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = this.wallSize * 1.05;
        this.head.castShadow = true; 
        this.head.receiveShadow = true; 

        // Body 
        const bodyGeometry = new THREE.BoxGeometry(this.wallSize * 0.56, this.wallSize * 0.84, this.wallSize * 0.35);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.5, roughness: 0.5 });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = this.wallSize * 0.56;
        this.body.castShadow = true; 
        this.body.receiveShadow = true;

        // Arms 
        const armGeometry = new THREE.BoxGeometry(this.wallSize * 0.21, this.wallSize * 0.7, this.wallSize * 0.21);
        const armMaterial = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.5, roughness: 0.5 });

        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-this.wallSize * 0.455, this.wallSize * 0.56, 0);
        this.leftArm.castShadow = true; 
        this.leftArm.receiveShadow = true; 

        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(this.wallSize * 0.455, this.wallSize * 0.56, 0);
        this.rightArm.castShadow = true; 
        this.rightArm.receiveShadow = true; 

        // Legs 
        const legGeometry = new THREE.BoxGeometry(this.wallSize * 0.28, this.wallSize * 0.84, this.wallSize * 0.28);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.5 });

        this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.leftLeg.position.set(-this.wallSize * 0.21, this.wallSize * 0.14, 0);
        this.leftLeg.castShadow = true; 
        this.leftLeg.receiveShadow = true; 

        this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.rightLeg.position.set(this.wallSize * 0.21, this.wallSize * 0.14, 0);
        this.rightLeg.castShadow = true; 
        this.rightLeg.receiveShadow = true; 

        // put parts together
        this.characterGroup.add(this.head, this.body, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);

        this.characterGroup.castShadow = true;
        this.characterGroup.receiveShadow = true;
    }

    getCharacterGroup() {
        return this.characterGroup;
    }

    //for walking
    update(deltaTime) {
        if (this.isWalking) {
            this.walkCycle += deltaTime * 10; 

            // make it walk using trig
            const legRotation = Math.sin(this.walkCycle) * 0.5; 
            const armRotation = Math.sin(this.walkCycle + Math.PI) * 0.5; 

            // Rotate legs
            this.leftLeg.rotation.x = legRotation;
            this.rightLeg.rotation.x = -legRotation;

            // Rotate arms
            this.leftArm.rotation.x = armRotation;
            this.rightArm.rotation.x = -armRotation;
        } else {
            // when not walking
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;
        }
    }

    setDirection(direction) {
        const angle = Math.atan2(direction.x, direction.z); 
        this.characterGroup.rotation.y = angle; 
    }

    startWalking() {
        this.isWalking = true;
    }

    stopWalking() {
        this.isWalking = false;
    }
}