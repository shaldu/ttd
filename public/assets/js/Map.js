import { Acceleration, Position, Sprite } from './Components/Components.js';
import { Vector3, Vector2, Raycaster, Color, Clock } from '/three/build/three.module.js';
import SimplexNoise from 'simplex-noise';
import * as THREE from 'three';
import { InstancedUniformsMesh } from '/three-instanced-uniforms-mesh/dist/three-instanced-uniforms-mesh.esm.js';
import fragmentShader from './shaders/fragmentShader.glsl.js';
import vertexShader from './shaders/vertexShader.glsl.js';

import { GrassTile, TreeTile, WaterTile, SandTile } from './Tile.js';

export default class Map {

    constructor(scene, world, size, texture, textureWidth, textureHeight, tileWidth, tileHeight, seed, prng) {
        this.scene = scene;
        this.world = world;
        this.prng = prng;
        this.size = size;
        this.texture = texture;
        this.tiles = [];
        this.simplex = new SimplexNoise(seed);
        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.meshLayerMain;
        this.meshLayerSecond;
        this.createTiles();

        for (let index = 0; index < 5; index++) {
            this.tiles.forEach(tile => {
                this.cleanWaterBorder(tile);
            })
        }

        this.tiles.forEach(tile => {
            this.createWaterBorder(tile);
        })

        this.tiles.forEach(tile => {
            if (tile.typeId === -10) {
                this.addCorrectTileToWaterBorder(tile);
            }
        })

        this.tiles.forEach(tile => {
            this.createSandBorder(tile);
        })

        this.createMapMainLayer();
        this.createMapSecondLayer();
    }

    getTileFromTilePosition(x, y) {
        let sizeSqr = Math.sqrt(this.size);
        let id = (y + x * sizeSqr);
        return this.tiles[id];
    }

    createTiles() {

        let sizeSqr = Math.sqrt(this.size)
        let iterator = 0;

        for (let x = 0; x < sizeSqr; x++) {
            for (let y = 0; y < sizeSqr; y++) {

                //let value2d = (Math.floor(this.simplex.noise2D(x * 0.022, y * 0.022) * 100)) / 20;
                //let value2d2 = (Math.floor(this.simplex.noise2D(x * 0.0035, y * 0.0035) * 100)) / 10;
                //let value2d3 = (Math.floor(this.simplex.noise2D(x * 0.0005, y * 0.0005) * 100)) / 70;
                //let value2d4 = (Math.floor(this.simplex.noise2D(x * 0.09, y * 0.08) * 100)) / 20;

                let value2d = (Math.floor(this.simplex.noise2D(x * 0.022, y * 0.022) * 100)) / 20;
                let value2d2 = (Math.floor(this.simplex.noise2D(x * 0.0035, y * 0.0035) * 100)) / 10;
                let value2d3 = (Math.floor(this.simplex.noise2D(x * 0.0005, y * 0.0005) * 100)) / 70;
                let value2d4 = (Math.floor(this.simplex.noise2D(x * 0.09, y * 0.08) * 100)) / 20;

                let value = (value2d + value2d2 - ((value2d3 * value2d4) / 2)) / 3;
                let waterlevel = 2.2;
                let treeAmount = .1;
                value = value + waterlevel;

                let tile = new WaterTile(iterator, x, y, -1, this.world, this, { "x": 13, "y": 18 })

                if (value < -1) {
                    tile = new WaterTile(iterator, x, y, -1, this.world, this, { "x": 13, "y": 18 })
                }


                if (value > 0.2) {
                    tile = new GrassTile(iterator, x, y, 1, this.world, this, { "x": 29, "y": 6 })
                }
                if (value > 1) {
                    tile = new GrassTile(iterator, x, y, 2, this.world, this, { "x": 30, "y": 6 })
                }
                if (value > 1.2) {
                    tile = new GrassTile(iterator, x, y, 3, this.world, this, { "x": 26, "y": 9 })
                }

                if (value > 1.9) {
                    tile = new GrassTile(iterator, x, y, 4, this.world, this, { "x": 27, "y": 9 })
                }

                value = (value - waterlevel) + treeAmount;

                if (value > 2.5) {
                    tile = new TreeTile(iterator, x, y, 5, this.world, this, { "x": 29, "y": 12 })
                }
                if (value > 2.8) {
                    tile = new TreeTile(iterator, x, y, 6, this.world, this, { "x": 29, "y": 0 })
                }
                if (value > 3) {
                    tile = new TreeTile(iterator, x, y, 7, this.world, this, { "x": 30, "y": 12 })
                }

                //turn border tiles to water
                if (x < 2 || y < 2 || x > sizeSqr - 3 || y > sizeSqr - 3) {
                    tile = new WaterTile(iterator, x, y, -1, this.world, this, { "x": 13, "y": 18 })
                }

                this.tiles.push(tile);
                iterator++;

            }
        }
    }

    getTileNeighbours(tile) {
        let neighbours = [];

        let id = tile.matrixId;
        let allTiles = this.size;
        let sizeSqr = Math.sqrt(allTiles);
        //check right
        if (id + 1 < allTiles) {
            neighbours.push(this.tiles[id + 1]);
        }
        //check left
        if (id - 1 >= 0) {
            neighbours.push(this.tiles[id - 1]);
        }
        //check top
        if (id + sizeSqr < allTiles) {
            neighbours.push(this.tiles[id + sizeSqr]);
        }
        //check bottom
        if (id - sizeSqr >= 0) {
            neighbours.push(this.tiles[id - sizeSqr]);
        }
        //check top right
        if (id + sizeSqr + 1 < allTiles) {
            neighbours.push(this.tiles[id + sizeSqr + 1]);
        }
        //check top left
        if (id + sizeSqr - 1 < allTiles) {
            neighbours.push(this.tiles[id + sizeSqr - 1]);
        }
        //check bottom right
        if (id - sizeSqr + 1 >= 0) {
            neighbours.push(this.tiles[id - sizeSqr + 1]);
        }
        //check bottom left
        if (id - sizeSqr - 1 >= 0) {
            neighbours.push(this.tiles[id - sizeSqr - 1]);
        }


        return neighbours;
    }

    createWaterBorder(tile) {
        let neighbours = this.getTileNeighbours(tile);
        neighbours.forEach(neighbour => {
            if (tile.typeId === -1) {
                if (neighbour.typeId !== -1) {
                    this.tiles[neighbour.matrixId] = new WaterTile(neighbour.matrixId, neighbour.x, neighbour.y, -10, this.world, this, { "x": 23, "y": 30 });
                }
            }
        });
    }

    createSandBorder(tile) {
        let neighbours = this.getTileNeighbours(tile);
        let allowedTypesWater = [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10];
        let allowedTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

        neighbours.forEach(neighbour => {
            if (allowedTypesWater.includes(tile.typeId)) {
                if (neighbour) {
                    if (allowedTypes.includes(neighbour.typeId)) {

                        if (this.prng.getRandomBool()) {
                            this.tiles[neighbour.matrixId] = new SandTile(neighbour.matrixId, neighbour.x, neighbour.y, 10, this.world, this, { "x": 0, "y": 13 });

                        } else {
                            this.tiles[neighbour.matrixId] = new SandTile(neighbour.matrixId, neighbour.x, neighbour.y, 10, this.world, this, { "x": 1, "y": 13 });

                        }
                    }
                }
            }
        });

    }

    cleanWaterBorder(tile) {
        let allowedTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        let allowedTypesWater = [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11];
        let neighbours = this.getTileNeighbours(tile);
        if (neighbours) {
            if (neighbours.length !== 0) {
                let sumWater = 0;
                let sumland = 0;

                neighbours.forEach(neighbour => {
                    if (neighbour) {
                        if (tile.typeId === -1) {
                            if (allowedTypes.includes(neighbour.typeId)) {
                                sumWater++;
                            }
                        }

                        if (allowedTypes.includes(tile.typeId)) {
                            if (allowedTypesWater.includes(neighbour.typeId)) {
                                sumland++;
                            }
                        }
                    }
                });


                if (sumWater > 4) {
                    this.tiles[tile.matrixId] = new GrassTile(tile.matrixId, tile.x, tile.y, 1, this.world, this, { "x": 29, "y": 6 });
                }

                if (sumland > 4) {
                    this.tiles[tile.matrixId] = new WaterTile(tile.matrixId, tile.x, tile.y, -1, this.world, this, { "x": 13, "y": 18 });
                }

            }
        }
    }


    addCorrectTileToWaterBorder(tile) {

        let id = tile.matrixId;
        let allTiles = this.size;
        let sizeSqr = Math.sqrt(allTiles);

        let allowedTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

        let bottomNeighbour = false;
        let topNeighbour = false;
        let leftNeighbour = false;
        let rightNeighbour = false;

        //check top
        if (id + 1 < allTiles && allowedTypes.includes(this.tiles[id + 1].typeId)) {
            topNeighbour = true;

        }
        //check bottom
        if (id - 1 >= 0 && allowedTypes.includes(this.tiles[id - 1].typeId)) {
            bottomNeighbour = true;

        }
        //check right
        if (id + sizeSqr < allTiles && allowedTypes.includes(this.tiles[id + sizeSqr].typeId)) {
            rightNeighbour = true;

        }

        //check left
        if (id - sizeSqr >= 0 && allowedTypes.includes(this.tiles[id - sizeSqr].typeId)) {
            leftNeighbour = true;
        }

        //toptile
        //if top is true and right is false and left is false
        if (topNeighbour && !rightNeighbour && !leftNeighbour) {
            this.tiles[tile.matrixId] = new WaterTile(tile.matrixId, tile.x, tile.y, -2, this.world, this, { "x": 14, "y": 17 });
        }

        //righttile
        //if right is true and top is false and bottom is false
        if (rightNeighbour && !topNeighbour && !bottomNeighbour) {
            this.tiles[tile.matrixId] = new WaterTile(tile.matrixId, tile.x, tile.y, -3, this.world, this, { "x": 14, "y": 19 });

        }

        //bottomtile
        //if bottom is true and right is false and left is false
        if (bottomNeighbour && !rightNeighbour && !leftNeighbour) {
            this.tiles[tile.matrixId] = new WaterTile(tile.matrixId, tile.x, tile.y, -4, this.world, this, { "x": 12, "y": 19 });
        }

        //lefttile
        //if left is true and top is false and bottom is false
        if (leftNeighbour && !topNeighbour && !bottomNeighbour) {
            this.tiles[tile.matrixId] = new WaterTile(tile.matrixId, tile.x, tile.y, -5, this.world, this, { "x": 12, "y": 17 });
        }

        //toprighttile
        //if top is true and right is true and bottom is false and left is false
        if (topNeighbour && rightNeighbour && !bottomNeighbour && !leftNeighbour) {
            this.tiles[tile.matrixId] = new WaterTile(tile.matrixId, tile.x, tile.y, -6, this.world, this, { "x": 15, "y": 17 });

        }

        //bttomrighttile
        //if bottom is true and right is true and top is false and left is false
        if (bottomNeighbour && rightNeighbour && !topNeighbour && !leftNeighbour) {
            this.tiles[tile.matrixId] = new WaterTile(tile.matrixId, tile.x, tile.y, -7, this.world, this, { "x": 15, "y": 18 });

        }

        //bottomlefttile
        //if bottom is true and left is true and top is false and right is false
        if (bottomNeighbour && leftNeighbour && !topNeighbour && !rightNeighbour) {
            this.tiles[tile.matrixId] = new WaterTile(tile.matrixId, tile.x, tile.y, -8, this.world, this, { "x": 11, "y": 19 });
        }

        //toplefttile
        //if top is true and left is true and bottom is false and right is false
        if (topNeighbour && leftNeighbour && !bottomNeighbour && !rightNeighbour) {
            this.tiles[tile.matrixId] = new WaterTile(tile.matrixId, tile.x, tile.y, -9, this.world, this, { "x": 12, "y": 16 });
        }

        //if top right is true and top is false and right is false and bottom is false and left is false
        if (!topNeighbour && !rightNeighbour && !bottomNeighbour && !leftNeighbour) {
            this.tiles[tile.matrixId] = new WaterTile(tile.matrixId, tile.x, tile.y, -1, this.world, this, { "x": 13, "y": 18 });
        }

    }

    createMapMainLayer() {
        this.texture.minFilter = THREE.NearestFilter;
        this.texture.magFilter = THREE.NearestFilter;

        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;

        //create sprite sheet texture
        this.texture.repeat.set(this.tileWidth / this.textureWidth, this.tileHeight / this.textureHeight);

        this.texture.minFilter = THREE.NearestFilter;
        this.texture.magFilter = THREE.NearestFilter;
        const scale = 1;
        const geometry = new THREE.PlaneBufferGeometry(scale, scale);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                texture1: { value: this.texture },
                repeat: { value: new THREE.Vector2(this.tileWidth / this.textureWidth, this.tileHeight / this.textureHeight) },
                texOffset: { value: new THREE.Vector2(0, 0) },
                vPosition: { value: new THREE.Vector4(0, 0, 0, 0) },
                opacity: { value: 0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
        });


        this.meshLayerMain = new InstancedUniformsMesh(geometry, material, this.size);

        this.tiles.forEach(tile => {
            if (tile) {
                const x = tile.x
                const y = tile.y;

                let offSetId = tile.textureOffset;

                let offsetX = offSetId.x * (this.tileWidth) / this.textureWidth;
                let offsetY = (1 - ((offSetId.y + 1) * (this.tileHeight) / this.textureHeight));

                this.meshLayerMain.setUniformAt('opacity', tile.matrixId, 1);
                this.meshLayerMain.setUniformAt('texOffset', tile.matrixId, new THREE.Vector2(offsetX, offsetY))
                this.meshLayerMain.setUniformAt('vPosition', tile.matrixId, new THREE.Vector4(x + .5, y + .5, 0, 0))
            }
        });

        this.scene.add(this.meshLayerMain);
    }

    createMapSecondLayer() {
        this.texture.minFilter = THREE.NearestFilter;
        this.texture.magFilter = THREE.NearestFilter;

        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;

        //create sprite sheet texture
        this.texture.repeat.set(this.tileWidth / this.textureWidth, this.tileHeight / this.textureHeight);

        this.texture.minFilter = THREE.NearestFilter;
        this.texture.magFilter = THREE.NearestFilter;
        const scale = 1;
        const geometry = new THREE.PlaneBufferGeometry(scale, scale);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                texture1: { value: this.texture },
                repeat: { value: new THREE.Vector2(this.tileWidth / this.textureWidth, this.tileHeight / this.textureHeight) },
                texOffset: { value: new THREE.Vector2(0, 0) },
                vPosition: { value: new THREE.Vector4(0, 0, 1, 0) },
                opacity: { value: 0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
        });


        this.meshLayerSecond = new InstancedUniformsMesh(geometry, material, this.size);

        this.tiles.forEach(tile => {
            if (tile) {
                const x = tile.x
                const y = tile.y;

                let offSetId = tile.textureOffset2;

                let offsetX = offSetId.x * (this.tileWidth) / this.textureWidth;
                let offsetY = (1 - ((offSetId.y + 1) * (this.tileHeight) / this.textureHeight));

                this.meshLayerSecond.setUniformAt('opacity', tile.matrixId, 1);
                this.meshLayerSecond.setUniformAt('texOffset', tile.matrixId, new THREE.Vector2(offsetX, offsetY))
                this.meshLayerSecond.setUniformAt('vPosition', tile.matrixId, new THREE.Vector4(x + .5, y + .5, 0, 0))
            }
        });

        this.scene.add(this.meshLayerSecond);
    }

    changeTile(matrixId, newTile) {
        this.tiles[matrixId] = newTile;
        this.tiles[matrixId].initTextureChange();
    }

    //change Tiles
    changeTileTexture(matrixId, textureOffset = null, textureOffset2 = null, opacity1 = null, opacity2 = null) {
       
        if (textureOffset != null) {
            let offSetId = textureOffset;

            let offsetX = offSetId.x * (this.tileWidth) / this.textureWidth;
            let offsetY = (1 - ((offSetId.y + 1) * (this.tileHeight) / this.textureHeight));

            this.meshLayerMain.setUniformAt('texOffset', matrixId, new THREE.Vector2(offsetX, offsetY));
        }
        if (textureOffset2 != null) {
            let offSetId = textureOffset2;

            let offsetX = offSetId.x * (this.tileWidth) / this.textureWidth;
            let offsetY = (1 - ((offSetId.y + 1) * (this.tileHeight) / this.textureHeight));

            this.meshLayerSecond.setUniformAt('texOffset', matrixId, new THREE.Vector2(offsetX, offsetY));
        }
        if (opacity1 != null) {
            this.meshLayerMain.setUniformAt('opacity', matrixId, opacity1);
        }
        if (opacity2 != null) {
            this.meshLayerSecond.setUniformAt('opacity', matrixId, opacity2);
        }
    }


}