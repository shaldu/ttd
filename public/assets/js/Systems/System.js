import { System } from 'ecsy';
import { Position, Acceleration, Sprite, Burning } from './../Components/Components.js';
import * as THREE from 'three'

export class MovableSystem extends System {
    init() {

    }

    // This method will get called on every frame by default
    execute(delta, time) {

        // Iterate through all the entities on the query
        this.queries.moving.results.forEach(entity => {

            // Get the `Acceleration` component as Read-only
            let acceleration = entity.getComponent(Acceleration).value;

            // Get the `Position` component as Writable

            let mesh = entity.getComponent(Sprite).mesh;
            mesh.position.x += acceleration * delta * Math.random();
            mesh.position.y += acceleration * delta * Math.random();
        });
    }
}

// Define a query of entities that have "Acceleration" and "Position" components
MovableSystem.queries = {
    moving: {
        components: [Acceleration, Position, Sprite]
    }
}

export class SpriteSystem extends System {

    init() {
        this.queries.sprites.results.forEach(entity => {
            const sprite = entity.getMutableComponent(Sprite);
            const position = entity.getMutableComponent(Position);

            if (sprite.textureUrl !== null) {
                sprite.texture = new THREE.TextureLoader().load(sprite.textureUrl);
            }

            sprite.texture.minFilter = THREE.NearestFilter;
            sprite.texture.magFilter = THREE.NearestFilter;

            //texture wraping for sprite sheet
            sprite.texture.wrapS = THREE.RepeatWrapping;
            sprite.texture.wrapT = THREE.RepeatWrapping;

            //create sprite sheet texture
            sprite.texture.repeat.set((sprite.frameWidth / sprite.width), (sprite.frameHeight / sprite.height));

            sprite.texture.offset.x = sprite.offSetX * (sprite.frameWidth) / sprite.width;
            sprite.texture.offset.y = (1 - ((sprite.offSetY + 1) * (sprite.frameHeight) / sprite.height));

            //create sprite
            let geometry = new THREE.PlaneGeometry(1, 1);

            let material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: sprite.texture,
                transparent: true,
            });
            sprite.mesh = new THREE.Mesh(geometry, material);

            sprite.mesh.position.set(position.x, position.y, position.z);

            sprite.scene.add(sprite.mesh);


        });
    }



    execute(delta, time) {
        this.queries.sprites.results.forEach(entity => {
            let sprite = entity.getMutableComponent(Sprite);

            if (sprite.loop) {
                sprite.frameTime = sprite.frameTime + delta;
                if (sprite.frameTime > sprite.frameRate) {
                    sprite.frameTime = 0;
                    sprite.frame++;
                    if (sprite.frame > sprite.frameCount) {
                        sprite.frame = 0;
                    }
                }

                sprite.texture.offset.x = sprite.frame * sprite.frameWidth / sprite.width;
                sprite.texture.offset.y = sprite.frame * sprite.frameHeight / sprite.height;
            }
        });
    }

}

SpriteSystem.queries = {
    sprites: {
        components: [Sprite, Position]
    }
}

export class BurningSystem extends System {


    init() {
        this.timerCount = 0;
        this.tickRate = 0.5;
        this.queries.burning.results.forEach(entity => {
            const burning = entity.getMutableComponent(Burning);
            burning.currentBurnTime = 0;
        });
    }

    execute(delta, time) {
        this.timerCount += delta;
        if (this.timerCount > this.tickRate) {
            this.timerCount = 0;
            this.queries.burning.results.forEach(entity => {
                let burning = entity.getMutableComponent(Burning);
                burning.currentBurnTime = burning.currentBurnTime + delta + this.tickRate;
                this.updateHealthValue(burning);
                this.spreadBurn(burning.entity);
                if (burning.currentBurnTime > burning.maxBurnTime || burning.entity.health <= 0) {
                    burning.isBurning = false;
                    burning.currentBurnTime = 0;
                    burning.entity.stopBurn();
                    if (burning.entity.health <= 0) {
                        burning.entity.burnedOut();
                    }
                }
            });
        }
    }

    updateHealthValue(burning) {
        //if less than 0 then set to 0
        burning.entity.health = burning.entity.health - burning.burnDamage < 0 ? 0 : burning.entity.health - burning.burnDamage;
    }

    spreadBurn(entity) {
        let neighbours = entity.map.getTileNeighbours(entity);
        let spreadChance = entity.spreadChancePercantage;
        //get random neighbour
        let randomNeighbour = neighbours[Math.floor(entity.map.prng.getRandomFloat() * neighbours.length)];
        if (entity.map.prng.getRandomBoolWithWeightPercentage(spreadChance)) {
            if (randomNeighbour !== undefined) {
                randomNeighbour.burn();
            }
        }
    }
}

BurningSystem.queries = {
    burning: {
        components: [Burning]
    }
}