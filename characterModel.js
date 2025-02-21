import * as THREE from 'three';

export class CharacterModel {
    constructor(wallSize) {
        this.wallSize = wallSize;
        this.characterGroup = new THREE.Group();
        this.createCharacter();
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
}