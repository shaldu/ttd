import * as THREE from 'three'
export default class Background {

    constructor(scene) {
        this.scene = scene;
        this.count = 65536;
        this.texture = new THREE.TextureLoader().load('/assets/sprites/backgroundTile.png');
        this.create();
    }

    create() {

        this.texture.minFilter = THREE.NearestFilter;
        this.texture.magFilter = THREE.NearestFilter;
        const scale = 1;
        const geometry = new THREE.PlaneGeometry(scale, scale);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: this.texture,
        });

        let mesh = new THREE.InstancedMesh(geometry, material, this.count);
        //create grid of instances
        for (let i = 0; i < this.count; i++) {
            const x = (i % Math.sqrt(this.count)) * scale;
            const y = Math.floor(i / Math.sqrt(this.count)) * scale;

            mesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, y, -1));
        }

        this.scene.add(mesh);
    }
}