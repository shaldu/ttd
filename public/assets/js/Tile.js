import Map from './Map.js';
import { Burning } from './Components/Components.js';

class Tile {
    constructor(matrixId, x, y, typeId, world, map, textureOffset = { x: 30, y: 28 }, textureOffset2 = { x: 30, y: 28 }) {
        this.matrixId = matrixId;
        this.x = x;
        this.y = y;
        this.typeId = typeId;
        this.world = world;
        this.name = "tile";
        this.description = "tile description";
        this.textureOffset = textureOffset;
        this.textureOffset2 = textureOffset2;
        this.state = null;
        this.map = map;

        //can be damaged
        this.canBeDamaged = false;
        this.health = 100;
        this.maxHealth = 100;

        //burning
        this.burnEntity = null;
        this.canBurn = false;
        this.isBurning = false;
        this.currentBurnTime = 0;
        this.maxBurnTime = 20;
        this.burnDamage = 10;
        this.burnedTextureOffset = this.textureOffset;
    }

    showTileInfoField() {
        let baseElm = document.querySelector('.selectStatusWindow');
        let titleElm = baseElm.querySelector('.tile-name');
        let titleDescription = baseElm.querySelector('.tile-description');
        let statusElm = baseElm.querySelector('.status-value');
        baseElm.classList.add('show');
        titleElm.innerHTML = this.name;
        titleDescription.innerHTML = this.description;
        if (this.isBurning) {
            statusElm.innerHTML = "burning";
        } else {
            statusElm.innerHTML = "";
        }
    }

    burn() {
        if (this.canBurn) {
            if (!this.isBurning) {
                this.map.changeTile(this.matrixId, null, { x: 0, y: 12 }, 0.75, 1);
                this.state = "burning";
                this.isBurning = true;
                this.burnEntity = this.world
                    .createEntity()
                    .addComponent(Burning, { tile: this, "maxBurnTime": this.maxBurnTime, "burnDamage": this.burnDamage })
            }
        }
    }

    stopBurn() {
        this.map.changeTile(this.matrixId, this.burnedTextureOffset, { x: 2, y: 12 }, 1, 1);
        this.canBurn = false;
        this.isBurning = false;
        this.burnEntity.remove();
    }
}

export class GrassTile extends Tile {
    constructor(matrixId, x, y, typeId, world, map, textureOffset = { x: 30, y: 28 }, textureOffset2 = { x: 30, y: 28 }) {
        super(matrixId, x, y, typeId, world, map, textureOffset, textureOffset2);

        this.name = "Grass";
        this.description = "Lush green grass, gatherable";

        this.canBeDamaged = true;
        this.health = 20;
        this.maxHealth = 20;

        this.canBurn = true;
        this.isBurning = false;
        this.currentBurnTime = 0;
        this.maxBurnTime = 10;
        this.burnDamage = 5;
        this.burnedTextureOffset = { x: 26, y: 10 };
    }

}

export class WaterTile extends Tile {
    constructor(matrixId, x, y, typeId, world, map, textureOffset = { x: 30, y: 28 }, textureOffset2 = { x: 30, y: 28 }) {
        super(matrixId, x, y, typeId, world, map, textureOffset, textureOffset2);

        this.name = "Shallow water";
        this.description = "Shallow water, suitable for swimming";
    }

}


export class TreeTile extends Tile {
    constructor(matrixId, x, y, typeId, world, map, textureOffset = { x: 30, y: 28 }, textureOffset2 = { x: 30, y: 28 }) {
        super(matrixId, x, y, typeId, world, map, textureOffset, textureOffset2);

        this.name = "Tree";
        this.description = "Big tree, gatherable";


        this.canBeDamaged = true;
        this.health = 100;
        this.maxHealth = 100;

        this.canBurn = true;
        this.isBurning = false;
        this.currentBurnTime = 0;
        this.maxBurnTime = 20;
        this.burnDamage = 10;
        this.burnedTextureOffset = { x: 29, y: 13 };
    }

}


export class SandTile extends Tile {
    constructor(matrixId, x, y, typeId, world, map, textureOffset = { x: 30, y: 28 }, textureOffset2 = { x: 30, y: 28 }) {
        super(matrixId, x, y, typeId, world, map, textureOffset, textureOffset2);

        this.name = "Sand";
        this.description = "Sand, gatherable";
    }

}