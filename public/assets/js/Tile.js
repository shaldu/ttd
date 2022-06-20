import Map from './Map.js';
import { EntityInfo } from './EntityInfo.js';
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

        this.entityInfo = new EntityInfo(this);

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

    initTextureChange() {
        this.map.changeTileTexture(this.matrixId, this.textureOffset, this.textureOffset2, 1, 1);
    }

    burn() {
        if (this.canBurn) {
            if (!this.isBurning) {
                this.map.changeTileTexture(this.matrixId, this.burnedTextureOffset, { x: 0, y: 12 }, 0.75, 1);
                this.state = "burning";
                this.isBurning = true;
                this.burnEntity = this.world
                    .createEntity()
                    .addComponent(Burning, { entity: this, "maxBurnTime": this.maxBurnTime, "burnDamage": this.burnDamage })
            }
        }
    }

    stopBurn() {
        this.canBurn = false;
        this.isBurning = false;
        this.map.changeTileTexture(this.matrixId, this.burnedTextureOffset, { x: 0, y: 12 }, 1, 0);
        this.burnEntity.remove();
    }

    burnedOut() {
        this.map.changeTile(this.matrixId, new AshTile(this.matrixId, this.x, this.y, 11, this.world, this.map, { "x": 2, "y": 4 }, this.textureOffset2));
    }
}

export class GrassTile extends Tile {
    constructor(matrixId, x, y, typeId, world, map, textureOffset = { x: 30, y: 28 }, textureOffset2 = { x: 30, y: 28 }) {
        super(matrixId, x, y, typeId, world, map, textureOffset, textureOffset2);

        this.name = "Grass";
        this.description = "Lush green grass, gatherable";

        this.canBeDamaged = true;
        this.health = 25;
        this.maxHealth = 25;

        this.canBurn = true;
        this.isBurning = false;
        this.currentBurnTime = 0;
        this.maxBurnTime = 10;
        this.burnDamage = 4;
        this.spreadChancePercantage = 75;
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
        this.spreadChancePercantage = 75;
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



export class AshTile extends Tile {
    constructor(matrixId, x, y, typeId, world, map, textureOffset = { x: 30, y: 28 }, textureOffset2 = { x: 30, y: 28 }) {
        super(matrixId, x, y, typeId, world, map, textureOffset, textureOffset2);

        this.name = "Ash";
        this.description = "Ash, gatherable";
    }

}